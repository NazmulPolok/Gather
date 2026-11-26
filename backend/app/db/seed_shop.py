from app.db.session import SessionLocal
from app.models.shop import Product

def seed_default_products():
    db = SessionLocal()
    count = db.query(Product).count()
    # Demo products removed per user requirement. Store operates cleanly with real user products only.
    print(f"Products count: {count}. Demo seeding disabled.")
    db.close()

if __name__ == "__main__":
    seed_default_products()
