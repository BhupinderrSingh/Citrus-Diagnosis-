import os
from dotenv import load_dotenv

# Load local .env variables if present
load_dotenv()

class Config:
    """Base configuration with standard security protocols."""
    # Flask Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'fallback-secret-key-for-dev-only'
    
    # Upload Security (Critical to prevent server crashes from massive files)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Cap uploads at 16MB per leaf image
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Redis Caching
    REDIS_HOST = os.environ.get('REDIS_HOST') or 'localhost'
    REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
    
    # Web3 & Blockchain (Digital Passport)
    WEB3_PROVIDER_URI = os.environ.get('WEB3_PROVIDER_URI')
    SMART_CONTRACT_ADDRESS = os.environ.get('SMART_CONTRACT_ADDRESS')
    
    # ML Model Config
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    PREDICTION_TIMEOUT = 120  # Seconds before aborting a stalled diagnosis

class DevelopmentConfig(Config):
    """Local Docker-Compose environment."""
    DEBUG = True
    TESTING = False
    # In dev, allow HTTP for Web3 testing
    PREFERRED_URL_SCHEME = 'http'

class ProductionConfig(Config):
    """Live OCI Ampere A1 deployment environment."""
    DEBUG = False
    TESTING = False
    
    # Enforce HTTPS in production
    PREFERRED_URL_SCHEME = 'https'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # In production, ensure these critical variables exist
    def __init__(self):
        if not os.environ.get('SECRET_KEY'):
            raise ValueError("No SECRET_KEY set for Flask application")
        if not os.environ.get('FIREBASE_ADMIN_CERT'):
            raise ValueError("No FIREBASE_ADMIN_CERT set for production")

class TestingConfig(Config):
    """Environment for pytest and GitHub Actions."""
    TESTING = True
    DEBUG = True
    REDIS_HOST = 'localhost' # Mock Redis for CI/CD

# Dictionary to easily map the string from your .env file to the correct class
config_by_name = dict(
    development=DevelopmentConfig,
    production=ProductionConfig,
    test=TestingConfig
)