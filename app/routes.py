from flask import Blueprint, render_template, jsonify
from flask_login import login_required, current_user
from flask_socketio import join_room
from . import socketio
from .analytics import get_task_analytics

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    return render_template('dashboard.html')

@main.route('/analytics/data')
@login_required
def analytics_data():
    stats = get_task_analytics(current_user.id)
    return jsonify(stats)

@socketio.on('join')
def on_join(data):
    # Ensure user is authenticated, though socketio decorators exist, simple check:
    if current_user.is_authenticated:
        join_room(current_user.id)
