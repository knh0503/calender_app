from flask import Blueprint, render_template, redirect
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/')
def root():
    if current_user.is_authenticated:
        return redirect('/main')
    else:
        return redirect('/welcome')

@views.route('/welcome')
def welcome():
    return render_template('welcome.html')

@views.route('/sign_up')
def sign_up():
    return render_template('sign_up.html')

@views.route('/sign_in')
def sign_in():
    return render_template('sign_in.html')

@views.route('/main')
@login_required
def main():
    return render_template('main.html', user=current_user)

@views.route('/calendar')
@login_required
def calendar():
    return render_template('calender.html', user=current_user)

@views.route('/users_and_events')
def users_and_events():
    return render_template('users_and_events.html')

@views.route('/profile_setting')
@login_required
def profile_setting():
    return render_template('profile_setting.html', user=current_user)

@views.route('/account_setting')
@login_required
def account_setting():
    return render_template('account_setting.html', user=current_user)