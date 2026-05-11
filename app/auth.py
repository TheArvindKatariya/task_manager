from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from .models import User
from . import db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
        
    if request.method == 'POST':
        # Accept both JSON and form data
        data = request.get_json() if request.is_json else request.form
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            if request.is_json:
                return jsonify({"status": "success"})
            return redirect(url_for('main.index'))
        else:
            if request.is_json:
                return jsonify({"status": "error", "message": "Invalid credentials"}), 401
            flash('Please check your login details and try again.')

    return render_template('auth.html')

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json() if request.is_json else request.form
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user:
        if request.is_json:
            return jsonify({"status": "error", "message": "Username already exists"}), 400
        flash('Username already exists.')
        return redirect(url_for('auth.login'))

    new_user = User(username=username, password_hash=generate_password_hash(password, method='scrypt'))
    db.session.add(new_user)
    db.session.commit()
    
    login_user(new_user)

    if request.is_json:
        return jsonify({"status": "success"})
    return redirect(url_for('main.index'))

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
