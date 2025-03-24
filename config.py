import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAP_CLIENT_ID = os.environ.get('MAP_CLIENT_ID')
    MAP_CLIENT_SECRET = os.environ.get('MAP_CLIENT_SECRET')
    SEARCH_CLIENT_ID = os.environ.get('SEARCH_CLIENT_ID')
    SEARCH_CLIENT_SECRET = os.environ.get('SEARCH_CLIENT_SECRET')    