from datetime import datetime, timezone
import re
import secrets
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.shop import Order, OrderItem, Product, Shop
from app.models.user import User
from app.schemas.shop import (
    MerchantAnalyticsResponse,
    MerchantOrderItemResponse,
    MerchantOrderResponse,
    OrderCreate,
    OrderItemResponse,
    OrderResponse,
    OrderStatusUpdate,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ShopCreate,
    ShopResponse,
    ShopUpdate,
)

router = APIRouter()


def _slugify(text: str) -> str:
    cleaned = re.sub(r"[^\w\s-]", "", text.strip().lower())
    slug = re.sub(r"[\s_-]+", "-", cleaned).strip("-")
    return slug or "shop"


def _format_shop_response(shop: Shop, db: Session) -> ShopResponse:
    products_count = db.scalar(
        select(func.count(Product.id)).where(Product.shop_id == shop.id)
    ) or 0

    owner_username = shop.owner.username if shop.owner else "merchant"

    return ShopResponse(
        id=shop.id,
        owner_id=shop.owner_id,
        owner_username=owner_username,
        name=shop.name,
        slug=shop.slug,
        tagline=shop.tagline,
        category=shop.category,
        description=shop.description,
        email=shop.email,
        phone=shop.phone,
        address=shop.address,
        city=shop.city,
        logo_url=shop.logo_url,
        banner_gradient=shop.banner_gradient,
        return_policy=shop.return_policy,
        rating=shop.rating,
        reviews_count=shop.reviews_count,
        status=shop.status,
        created_at=shop.created_at,
        products_count=products_count,
    )


# --- SHOP MANAGEMENT ENDPOINTS ---

@router.get("/me", response_model=ShopResponse | None)
def get_my_shop(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ShopResponse | None:
    shop = db.scalar(
        select(Shop)
        .options(selectinload(Shop.owner))
        .where(Shop.owner_id == user.id)
    )
    if not shop:
        return None
    return _format_shop_response(shop, db)


@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
def create_shop(
    payload: ShopCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ShopResponse:
    existing = db.scalar(select(Shop).where(Shop.owner_id == user.id))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active shop on Gather.",
        )

    base_slug = _slugify(payload.name)
    slug = base_slug
    counter = 1
    while db.scalar(select(Shop.id).where(Shop.slug == slug)):
        slug = f"{base_slug}-{counter}"
        counter += 1

    new_shop = Shop(
        owner_id=user.id,
        name=payload.name.strip(),
        slug=slug,
        tagline=payload.tagline.strip() if payload.tagline else None,
        category=payload.category,
        description=payload.description.strip() if payload.description else None,
        email=payload.email.strip() if payload.email else user.email,
        phone=payload.phone.strip() if payload.phone else None,
        address=payload.address.strip() if payload.address else None,
        city=payload.city.strip() if payload.city else "Dhaka",
        logo_url=payload.logo_url,
        banner_gradient=payload.banner_gradient,
        return_policy=payload.return_policy,
        rating=5.0,
        reviews_count=0,
        status="active",
    )
    db.add(new_shop)
    db.commit()
    db.refresh(new_shop)

    # Reload with owner
    new_shop = db.scalar(
        select(Shop).options(selectinload(Shop.owner)).where(Shop.id == new_shop.id)
    )
    return _format_shop_response(new_shop, db)


@router.patch("/me", response_model=ShopResponse)
def update_my_shop(
    payload: ShopUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ShopResponse:
    shop = db.scalar(
        select(Shop)
        .options(selectinload(Shop.owner))
        .where(Shop.owner_id == user.id)
    )
    if not shop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")

    if payload.name is not None and payload.name.strip():
        shop.name = payload.name.strip()
    if payload.tagline is not None:
        shop.tagline = payload.tagline.strip()
    if payload.category is not None:
        shop.category = payload.category
    if payload.description is not None:
        shop.description = payload.description.strip()
    if payload.email is not None:
        shop.email = payload.email.strip()
    if payload.phone is not None:
        shop.phone = payload.phone.strip()
    if payload.address is not None:
        shop.address = payload.address.strip()
    if payload.city is not None:
        shop.city = payload.city.strip()
    if payload.logo_url is not None:
        shop.logo_url = payload.logo_url
    if payload.banner_gradient is not None:
        shop.banner_gradient = payload.banner_gradient
    if payload.return_policy is not None:
        shop.return_policy = payload.return_policy

    db.commit()
    db.refresh(shop)
    return _format_shop_response(shop, db)


@router.get("/public/{shop_id_or_slug}", response_model=ShopResponse)
def get_public_shop(
    shop_id_or_slug: str,
    db: Session = Depends(get_db),
) -> ShopResponse:
    if shop_id_or_slug.isdigit():
        shop = db.scalar(
            select(Shop)
            .options(selectinload(Shop.owner))
            .where(Shop.id == int(shop_id_or_slug))
        )
    else:
        shop = db.scalar(
            select(Shop)
            .options(selectinload(Shop.owner))
            .where(Shop.slug == shop_id_or_slug)
        )

    if not shop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")

    return _format_shop_response(shop, db)


# --- PRODUCT CATALOG ENDPOINTS ---

@router.get("/products", response_model=list[ProductResponse])
def list_products(
    category: str | None = None,
    query: str | None = None,
    shop_id: int | None = None,
    sort_by: str = "featured",
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    stmt = select(Product).options(selectinload(Product.shop))

    if category and category.lower() != "all":
        stmt = stmt.where(func.lower(Product.category) == category.lower())

    if shop_id is not None:
        stmt = stmt.where(Product.shop_id == shop_id)

    if query and query.strip():
        search_pattern = f"%{query.strip().lower()}%"
        stmt = stmt.where(
            func.lower(Product.name).like(search_pattern)
            | func.lower(Product.description).like(search_pattern)
            | func.lower(Product.category).like(search_pattern)
        )

    if sort_by == "price-low":
        stmt = stmt.order_by(Product.price.asc())
    elif sort_by == "price-high":
        stmt = stmt.order_by(Product.price.desc())
    elif sort_by == "rating":
        stmt = stmt.order_by(Product.rating.desc())
    else:
        stmt = stmt.order_by(Product.id.desc())

    products = db.scalars(stmt).all()

    return [
        ProductResponse(
            id=p.id,
            shop_id=p.shop_id,
            shop_name=p.shop.name if p.shop else "Gather Marketplace",
            name=p.name,
            category=p.category,
            price=p.price,
            original_price=p.original_price,
            rating=p.rating,
            reviews_count=p.reviews_count,
            badge=p.badge,
            description=p.description,
            image_url=p.image_url,
            in_stock=p.in_stock,
            created_at=p.created_at,
        )
        for p in products
    ]


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProductResponse:
    shop = db.scalar(select(Shop).where(Shop.owner_id == user.id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must set up a shop before publishing products.",
        )

    product = Product(
        shop_id=shop.id,
        name=payload.name.strip(),
        category=payload.category,
        price=payload.price,
        original_price=payload.original_price,
        badge=payload.badge,
        description=payload.description.strip() if payload.description else None,
        image_url=payload.image_url.strip(),
        in_stock=payload.in_stock,
        rating=5.0,
        reviews_count=0,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return ProductResponse(
        id=product.id,
        shop_id=shop.id,
        shop_name=shop.name,
        name=product.name,
        category=product.category,
        price=product.price,
        original_price=product.original_price,
        rating=product.rating,
        reviews_count=product.reviews_count,
        badge=product.badge,
        description=product.description,
        image_url=product.image_url,
        in_stock=product.in_stock,
        created_at=product.created_at,
    )


@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProductResponse:
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.shop))
        .where(Product.id == product_id)
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if not product.shop or product.shop.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this product.",
        )

    if payload.name is not None and payload.name.strip():
        product.name = payload.name.strip()
    if payload.category is not None and payload.category.strip():
        product.category = payload.category.strip()
    if payload.price is not None and payload.price > 0:
        product.price = payload.price
    if payload.original_price is not None:
        product.original_price = payload.original_price
    if payload.badge is not None:
        product.badge = payload.badge.strip() if payload.badge.strip() else None
    if payload.description is not None:
        product.description = payload.description.strip()
    if payload.image_url is not None and payload.image_url.strip():
        product.image_url = payload.image_url.strip()
    if payload.in_stock is not None:
        product.in_stock = payload.in_stock

    db.commit()
    db.refresh(product)

    return ProductResponse(
        id=product.id,
        shop_id=product.shop_id,
        shop_name=product.shop.name if product.shop else "Gather Marketplace",
        name=product.name,
        category=product.category,
        price=product.price,
        original_price=product.original_price,
        rating=product.rating,
        reviews_count=product.reviews_count,
        badge=product.badge,
        description=product.description,
        image_url=product.image_url,
        in_stock=product.in_stock,
        created_at=product.created_at,
    )


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.shop))
        .where(Product.id == product_id)
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if not product.shop or product.shop.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this product.",
        )

    db.delete(product)
    db.commit()
    return {"status": "ok", "deleted_product_id": product_id}


# --- ORDER MANAGEMENT ENDPOINTS ---

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> OrderResponse:
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty.")

    total_amount = sum(item.price * max(1, item.quantity) for item in payload.items)
    order_code = f"ORD-{secrets.token_hex(4).upper()}"

    order = Order(
        order_code=order_code,
        user_id=user.id,
        total_amount=total_amount,
        shipping_name=payload.shipping_name.strip(),
        shipping_phone=payload.shipping_phone.strip(),
        shipping_address=payload.shipping_address.strip(),
        shipping_city=payload.shipping_city.strip(),
        payment_method=payload.payment_method,
        status="Processing",
    )
    db.add(order)
    db.flush()

    order_items: list[OrderItem] = []
    for item in payload.items:
        oi = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            price=item.price,
            quantity=max(1, item.quantity),
            image_url=item.image_url,
        )
        db.add(oi)
        order_items.append(oi)

    db.commit()
    db.refresh(order)

    return OrderResponse(
        id=order.id,
        order_code=order.order_code,
        user_id=order.user_id,
        total_amount=order.total_amount,
        shipping_name=order.shipping_name,
        shipping_phone=order.shipping_phone,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        payment_method=order.payment_method,
        status=order.status,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=oi.id,
                product_id=oi.product_id,
                product_name=oi.product_name,
                price=oi.price,
                quantity=oi.quantity,
                image_url=oi.image_url,
            )
            for oi in order_items
        ],
    )


@router.get("/orders/me", response_model=list[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[OrderResponse]:
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
    ).all()

    return [
        OrderResponse(
            id=o.id,
            order_code=o.order_code,
            user_id=o.user_id,
            total_amount=o.total_amount,
            shipping_name=o.shipping_name,
            shipping_phone=o.shipping_phone,
            shipping_address=o.shipping_address,
            shipping_city=o.shipping_city,
            payment_method=o.payment_method,
            status=o.status,
            created_at=o.created_at,
            items=[
                OrderItemResponse(
                    id=item.id,
                    product_id=item.product_id,
                    product_name=item.product_name,
                    price=item.price,
                    quantity=item.quantity,
                    image_url=item.image_url,
                )
                for item in o.items
            ],
        )
        for o in orders
    ]


# --- MERCHANT DASHBOARD & ORDERS MANAGEMENT ---

@router.get("/merchant/orders", response_model=list[MerchantOrderResponse])
def get_merchant_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MerchantOrderResponse]:
    shop = db.scalar(select(Shop).where(Shop.owner_id == user.id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have an active merchant shop.",
        )

    shop_product_ids = db.scalars(select(Product.id).where(Product.shop_id == shop.id)).all()
    if not shop_product_ids:
        return []

    order_ids = db.scalars(
        select(OrderItem.order_id)
        .where(OrderItem.product_id.in_(shop_product_ids))
        .distinct()
    ).all()

    if not order_ids:
        return []

    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id.in_(order_ids))
        .order_by(Order.created_at.desc())
    ).all()

    results: list[MerchantOrderResponse] = []
    for o in orders:
        merchant_items = [it for it in o.items if it.product_id in shop_product_ids]
        if not merchant_items:
            continue
        merchant_subtotal = sum(it.price * it.quantity for it in merchant_items)
        results.append(
            MerchantOrderResponse(
                id=o.id,
                order_code=o.order_code,
                user_id=o.user_id,
                total_amount=o.total_amount,
                merchant_subtotal=round(merchant_subtotal, 2),
                shipping_name=o.shipping_name,
                shipping_phone=o.shipping_phone,
                shipping_address=o.shipping_address,
                shipping_city=o.shipping_city,
                payment_method=o.payment_method,
                status=o.status,
                created_at=o.created_at,
                items=[
                    MerchantOrderItemResponse(
                        id=it.id,
                        product_id=it.product_id,
                        product_name=it.product_name,
                        price=it.price,
                        quantity=it.quantity,
                        image_url=it.image_url,
                    )
                    for it in merchant_items
                ],
            )
        )
    return results


@router.patch("/merchant/orders/{order_id}/status", response_model=MerchantOrderResponse)
def update_merchant_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MerchantOrderResponse:
    shop = db.scalar(select(Shop).where(Shop.owner_id == user.id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have an active merchant shop.",
        )

    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    shop_product_ids = set(db.scalars(select(Product.id).where(Product.shop_id == shop.id)).all())
    merchant_items = [it for it in order.items if it.product_id in shop_product_ids]
    if not merchant_items:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This order does not belong to your shop.",
        )

    valid_statuses = {"Processing", "On the Way", "Delivered"}
    raw_status = payload.status.strip()
    status_map = {
        "processing": "Processing",
        "on the way": "On the Way",
        "ontheway": "On the Way",
        "shipped": "On the Way",
        "delivered": "Delivered",
    }
    normalized_status = status_map.get(raw_status.lower(), raw_status)
    if normalized_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Allowed: Processing, On the Way, Delivered.",
        )

    order.status = normalized_status
    db.commit()
    db.refresh(order)

    merchant_subtotal = sum(it.price * it.quantity for it in merchant_items)
    return MerchantOrderResponse(
        id=order.id,
        order_code=order.order_code,
        user_id=order.user_id,
        total_amount=order.total_amount,
        merchant_subtotal=round(merchant_subtotal, 2),
        shipping_name=order.shipping_name,
        shipping_phone=order.shipping_phone,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        payment_method=order.payment_method,
        status=order.status,
        created_at=order.created_at,
        items=[
            MerchantOrderItemResponse(
                id=it.id,
                product_id=it.product_id,
                product_name=it.product_name,
                price=it.price,
                quantity=it.quantity,
                image_url=it.image_url,
            )
            for it in merchant_items
        ],
    )


@router.get("/merchant/analytics", response_model=MerchantAnalyticsResponse)
def get_merchant_analytics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MerchantAnalyticsResponse:
    shop = db.scalar(select(Shop).where(Shop.owner_id == user.id))
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have an active merchant shop.",
        )

    shop_product_ids = db.scalars(select(Product.id).where(Product.shop_id == shop.id)).all()
    total_products = len(shop_product_ids)

    if not shop_product_ids:
        return MerchantAnalyticsResponse(
            total_orders=0,
            total_revenue=0.0,
            processing_count=0,
            on_the_way_count=0,
            delivered_count=0,
            total_products=0,
        )

    order_ids = db.scalars(
        select(OrderItem.order_id)
        .where(OrderItem.product_id.in_(shop_product_ids))
        .distinct()
    ).all()

    if not order_ids:
        return MerchantAnalyticsResponse(
            total_orders=0,
            total_revenue=0.0,
            processing_count=0,
            on_the_way_count=0,
            delivered_count=0,
            total_products=total_products,
        )

    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id.in_(order_ids))
    ).all()

    total_revenue = 0.0
    processing_count = 0
    on_the_way_count = 0
    delivered_count = 0

    for o in orders:
        merchant_items = [it for it in o.items if it.product_id in shop_product_ids]
        total_revenue += sum(it.price * it.quantity for it in merchant_items)
        if o.status.lower() in ["processing"]:
            processing_count += 1
        elif o.status.lower() in ["on the way", "shipped"]:
            on_the_way_count += 1
        elif o.status.lower() in ["delivered"]:
            delivered_count += 1

    return MerchantAnalyticsResponse(
        total_orders=len(orders),
        total_revenue=round(total_revenue, 2),
        processing_count=processing_count,
        on_the_way_count=on_the_way_count,
        delivered_count=delivered_count,
        total_products=total_products,
    )
