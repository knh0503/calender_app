class Calendar {
    // 생성자
    constructor() { 
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        // 캘린더 초기화 메서드를 호출
        this.init();
    }

    // 초기화 메서드
    init() {
        // 버튼 클릭 이벤트 리스너를 설정
        this.setupEventListeners();
        // 캘린더를 화면에 랜더링
        this.render();
    }

    // 이벤트 리스너 설정
    // 클릭시 월, 연도 변경 후 캘린더 다시 랜더링링
    setupEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.render();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.render();
        });
    }

    // 캘린더 랜더링
    render() {
        const grid = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('currentMonth');
        
        // Clear previous content
        grid.innerHTML = '';
        
        // Set month display
        monthDisplay.textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;
        
        // Add day headers
        this.days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });
        
        // Get first day of month
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const startingDay = firstDay.getDay();
        
        // Get last day of month
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        
        // Get last day of previous month
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        // Previous month days
        for (let i = startingDay - 1; i >= 0; i--) {
            this.createDayCell(prevMonthLastDay - i, 'other-month');
        }
        
        // Current month days
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const isToday = i === today.getDate() && 
                          this.currentMonth === today.getMonth() && 
                          this.currentYear === today.getFullYear();
            // isToday == True면 'today', 아니면 ''
            this.createDayCell(i, isToday ? 'today' : '');
        }
        
        // Next month days
        const remainingCells = 42 - (startingDay + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            this.createDayCell(i, 'other-month');
        }
    }

    createDayCell(day, className) {
        const cell = document.createElement('div');
        // 현재 월 => 'calender-cell', 다른 월 => 'calender-cell.other month', 오늘 => 'calendar-cell.today'
        cell.className = `calendar-cell ${className}`;
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = day;
        
        cell.appendChild(dateDiv);
        document.getElementById('calendarGrid').appendChild(cell);
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }
}

// Initialize calendar
new Calendar();

// click setting button
document.getElementById('setting-button').addEventListener('click', function(e) {
    e.preventDefault();
    const settingNav = document.getElementById('settingsMenu');
    settingNav.style.display = settingNav.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', function(e) {
    const dropdown = document.querySelector('.dropdown');
    const isClickInside = dropdown.contains(e.target);
    if (!isClickInside) {
        dropdown.querySelector('.dropdown-content').style.display = 'none';
    }
});