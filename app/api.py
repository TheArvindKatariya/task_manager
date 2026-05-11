from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import Task
from . import db, socketio

api = Blueprint('api', __name__)

@api.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_date.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@api.route('/tasks', methods=['POST'])
@login_required
def add_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description', '')
    priority = data.get('priority', 'Medium')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
        
    task = Task(title=title, description=description, priority=priority, user_id=current_user.id)
    db.session.add(task)
    db.session.commit()
    
    task_dict = task.to_dict()
    socketio.emit('task_updated', {'action': 'add', 'task': task_dict}, room=current_user.id)
    return jsonify(task_dict), 201

@api.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'status' in data:
        task.status = data['status']
        
    db.session.commit()
    
    task_dict = task.to_dict()
    socketio.emit('task_updated', {'action': 'update', 'task': task_dict}, room=current_user.id)
    return jsonify(task_dict)

@api.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    
    socketio.emit('task_updated', {'action': 'delete', 'task_id': task_id}, room=current_user.id)
    return jsonify({'message': 'Task deleted successfully'}), 200
