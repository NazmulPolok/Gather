from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ShopCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    tagline: str | None = Field(None, max_length=255)
    category: str = Field("Electronics", max_length=64)
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = "Dhaka"
    logo_url: str | None = None
    banner_gradient: str | None = None
    return_policy: str | None = "7 Days Replacement Warranty & 100% Genuine Guarantee"


class ShopUpdate(BaseModel):
    name: str | None = None
    tagline: str | None = None
    category: str | None = None
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    logo_url: str | None = None
    banner_gradient: str | None = None
    return_policy: str | None = None


class ShopResponse(BaseModel):
    id: int
    owner_id: int
    owner_username: str
    name: str
    slug: str
    tagline: str | None = None
    category: str
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    logo_url: str | None = None
    banner_gradient: str | None = None
    return_policy: str | None = None
    rating: float = 5.0
    reviews_count: int = 0
    status: str = "active"
    created_at: datetime
    products_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    category: str = Field(..., max_length=64)
    price: float = Field(..., gt=0)
    original_price: float | None = None
    badge: str | None = None
    description: str | None = None
    image_url: str = Field(..., max_length=512)
    in_stock: bool = True


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    price: float | None = None
    original_price: float | None = None
    badge: str | None = None
    description: str | None = None
    image_url: str | None = None
    in_stock: bool | None = None


class ProductResponse(BaseModel):
    id: int
    shop_id: int | None = None
    shop_name: str | None = None
    name: str
    category: str
    price: float
    original_price: float | None = None
    rating: float = 5.0
    reviews_count: int = 0
    badge: str | None = None
    description: str | None = None
    image_url: str
    in_stock: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderItemInput(BaseModel):
    product_id: int | None = None
    product_name: str
    price: float
    quantity: int = 1
    image_url: str | None = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int | None = None
    product_name: str
    price: float
    quantity: int
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    shipping_name: str = Field(..., min_length=2, max_length=100)
    shipping_phone: str = Field(..., min_length=5, max_length=50)
    shipping_address: str = Field(..., min_length=3, max_length=255)
    shipping_city: str = Field(..., min_length=2, max_length=100)
    payment_method: str = Field("cod", max_length=32)
    items: list[OrderItemInput] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    order_code: str
    user_id: int
    total_amount: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    payment_method: str
    status: str
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., max_length=32)


class MerchantOrderItemResponse(BaseModel):
    id: int
    product_id: int | None = None
    product_name: str
    price: float
    quantity: int
    image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class MerchantOrderResponse(BaseModel):
    id: int
    order_code: str
    user_id: int
    total_amount: float
    merchant_subtotal: float
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    payment_method: str
    status: str
    created_at: datetime
    items: list[MerchantOrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MerchantAnalyticsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    processing_count: int
    on_the_way_count: int
    delivered_count: int
    total_products: int

