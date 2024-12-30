from flask import Blueprint, jsonify, render_template
from app.models.calender import User, Event
from app import db

main = Blueprint('main', __name__)

@main.route('/users')
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email
    } for user in users])

@main.route('/events')
def get_events():
    events = Event.query.all()
    return jsonify([{
        'id': event.id,
        'title': event.title,
        'start_date': event.start_date.isoformat(),
        'end_date': event.end_date.isoformat()
    } for event in events])

@main.route('/')
def home():
    return render_template('users_and_events.html')