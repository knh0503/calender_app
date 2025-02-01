class Calendar_v1 {
    constructor() { 
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.events = {};
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }

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

    render() {
        const grid = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('currentMonth');
        
        grid.innerHTML = '';
        monthDisplay.textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;
        
        this.days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });
        
        // 달력 날짜 계산
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const startingDay = firstDay.getDay();
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        // 이전 달의 날짜들
        for (let i = startingDay - 1; i >= 0; i--) {
            const prevMonthDate = new Date(this.currentYear, this.currentMonth-1, prevMonthLastDay - i);
            this.createDayCell(prevMonthDate, 'other-month');
        }
        
        // 현재 달의 날짜들
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, i);
            const isToday = i === today.getDate() && 
                          this.currentMonth === today.getMonth() && 
                          this.currentYear === today.getFullYear();
            this.createDayCell(currentDate, isToday ? 'today' : '');
        }
        
        // 다음 달의 날짜들
        const remainingCells = 42 - (startingDay + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDate = new Date(this.currentYear, this.currentMonth+1, i);
            this.createDayCell(nextMonthDate, 'other-month');
        }

        // 모든 셀이 생성된 후 이벤트 렌더링
        this.renderEvents();
    }

    createDayCell(date, className) {
        const cell = document.createElement('div');
        cell.className = `calendar-cell ${className}`;
        cell.dataset.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];

        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = date.getDate();
        cell.appendChild(dateDiv);

        document.getElementById('calendarGrid').appendChild(cell);
    }

    // perplextity 방법 1
    renderEvents() {
        const eventRows = new Map();
    
        Object.values(this.events).forEach(eventList => {
            eventList.forEach(event => {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);
                let currentDate = new Date(startDate);
    
                while (currentDate <= endDate) {
                    const dateKey = currentDate.toISOString().split('T')[0];
                    const cell = document.querySelector(`[data-date="${dateKey}"]`);
    
                    if (cell) {
                        let rowIndex = 0;
                        while (this.isOverlapping(currentDate, currentDate, rowIndex, eventRows)) {
                            rowIndex++;
                        }
    
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event-item';
                        eventDiv.style.position = 'absolute';
                        eventDiv.style.top = `${rowIndex * 24 + 25}px`;
                        eventDiv.style.backgroundColor = event.color || '#f1f1f1';
                        if (event.allDay) {
                            eventDiv.className += ' all-day';
                            eventDiv.style.width = `${cell.offsetWidth - 8}px`;
                            eventDiv.textContent = event.title;
                        } else {
                            eventDiv.className += ' not-all';
                            eventDiv.style.borderLeft = `solid 3px ${event.color || '#f1f1f1'}`;
                            eventDiv.textContent = `${event.start.split('T')[1].substring(0,5)}`;
                        }
    
                        cell.appendChild(eventDiv);
                        this.updateEventRows(currentDate, currentDate, rowIndex, eventRows);
                    }
    
                    currentDate.setDate(currentDate.getDate() + 1);
                    if (currentDate.getDay() === 0) break; // 일요일에 줄바꿈
                }
                
            });
        });

    }

    isOverlapping(start, end, rowIndex, eventRows) {
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];
    
        for (let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0];
            if (eventRows.has(dateKey) && eventRows.get(dateKey).includes(rowIndex)) {
                return true;
            }
        }
        return false;
    }

    updateEventRows(start, end, rowIndex, eventRows) {
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];
    
        for (let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0];
            if (!eventRows.has(dateKey)) {
                eventRows.set(dateKey, []);
            }
            eventRows.get(dateKey).push(rowIndex);
        }
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    loadEvents() {
        axios.get('/get_events')
            .then(response => {
                this.events = {};
                response.data.forEach(event => {
                    let startDate = new Date(event.start);
                    // const endDate = new Date(event.end);

                    // for (let date = new Date(startDate); date<=endDate; date.setDate(date.getDate()+1)) {
                        const dateKey = startDate.toISOString().split('T')[0];

                        if (!this.events[dateKey]) {
                            this.events[dateKey] = [];
                        }

                        this.events[dateKey].push(event)
                    // }
                });
                // console.log(this.events);
                this.render();
            })
            .catch(error => {
                console.error('error' , error);
            });
    }
}

// 기존 캘린더, 여러 날짜 고려한 형태
class Calendar_v2 {
    constructor() { 
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.events = {};
        this.eventRows = {};
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }

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

        document.getElementById('allDay').addEventListener('change', function() {
            document.getElementById('startTime').disabled = this.checked;
            document.getElementById('endTime').disabled = this.checked;
            document.getElementById('endDate').disabled = (!this.checked);
        })

        document.getElementById('addEventButton').addEventListener('click', () => this.showAddEventModal());
        document.getElementById('closeEventModal').addEventListener('click', () => this.closeAddEventModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeAddEventModal());
        document.getElementById('eventForm').addEventListener('submit', (e) => this.addEvent(e));
    }   

    render() {
        const grid = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('currentMonth');
        
        grid.innerHTML = '';
        monthDisplay.textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;
        
        // Add day headers
        this.days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const startingDay = firstDay.getDay();
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        for (let i = startingDay - 1; i >= 0; i--) {
            const prevMonthDate = new Date(this.currentYear, this.currentMonth-1, prevMonthLastDay - i);
            this.createDayCell(prevMonthDate, 'other-month');
        }
        
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, i);
            const isToday = i === today.getDate() && 
                          this.currentMonth === today.getMonth() && 
                          this.currentYear === today.getFullYear();
            // isToday == True면 'today', 아니면 ''
            this.createDayCell(currentDate, isToday ? 'today' : '');
        }
        
        const remainingCells = 42 - (startingDay + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDate = new Date(this.currentYear, this.currentMonth+1, i);
            this.createDayCell(nextMonthDate, 'other-month');
        }

        this.renderEvents();
    }

    createDayCell(date, className) {
        // 현재 월 => 'calender-cell ', 다른 월 => 'calender-cell other month', 오늘 => 'calendar-cell today'      
        const cell = document.createElement('div');
        cell.className = `calendar-cell ${className}`;
        cell.dataset.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];

        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = date.getDate();
        cell.appendChild(dateDiv);

        // cell.addEventListener('click', () => this.showDateEvents(date));
        document.getElementById('calendarGrid').appendChild(cell);
    }

    renderEvents() {
        const sortedEvents = Object.values(this.events)
        .sort((a, b) => new Date(a.start) - new Date(b.start));

        const eventRows = new Map();

        sortedEvents.forEach(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
            const dateKey = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())).toISOString().split('T')[0];
            console.log(startDate, endDate, event.allDay);

            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';

            // 이 이벤트의 행 위치 찾기
            let rowIndex = 0;
            while (this.isOverlapping(startDate, endDate, rowIndex, eventRows)) {
                rowIndex++;
            }
            this.updateEventRows(startDate, endDate, rowIndex, eventRows);

            eventDiv.style.position = 'absolute';
            eventDiv.style.height = '20px';
            eventDiv.style.top = `${rowIndex * 25 + 33}px`;

            const startCell = document.querySelector(`[data-date="${dateKey}`);

            // 여러 날짜에 걸친 이벤트의 경우 너비 계산
            const cellWidth = startCell.offsetWidth;
            eventDiv.style.width = `${cellWidth * duration - 20}px`;
            
            if (startCell) {
                if (event.allDay) {
                    eventDiv.className += ' all-day';
                    eventDiv.style.backgroundColor = event.color || '#f1f1f1';
                    eventDiv.textContent = event.title;
                }
                else {
                    eventDiv.className += ' not-all';
                    eventDiv.style.setProperty('--event-bar-color', event.color || '#f1f1f1');
                    eventDiv.textContent = `${event.start.split('T')[1].substring(0,5)}`;
                }
                startCell.appendChild(eventDiv);
            }
        });
    }

    // 특정 행에서 이벤트가 겹치는지 확인하는 함수
    isOverlapping(start, end, rowIndex, eventRows) {
        for (const [date, rows] of eventRows) {
            const existingDate = new Date(date);
            if (rows[rowIndex] && start <= rows[rowIndex] && end >= existingDate) {
                return true;
            }
        }
        return false;
    }
    
    // 이벤트의 위치를 기록하는 함수
    updateEventRows(start, end, rowIndex, eventRows) {
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (!eventRows.has(dateStr)) {
                eventRows.set(dateStr, []);
            }
            const rows = eventRows.get(dateStr);
            while (rows.length <= rowIndex) {
                rows.push(null);
            }
            rows[rowIndex] = end;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        console.log(eventRows);
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    showAddEventModal() {
        const modal = document.getElementById('eventModal');
        const modalOverlay = document.getElementById('modal-overlay');
        modal.style.display = 'block';
        modalOverlay.style.display = 'block';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = today;
    }

    closeAddEventModal() {
        document.querySelector('.modal-overlay').style.display = "none";
        document.querySelector('.modal').style.display = "none";
    }

    addEvent(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        axios.post('/add_event', formData)
        .then((response) => {
            showToastify(response.data.message);
            this.closeAddEventModal();
            this.render();
            document.getElementById('eventForm').reset();
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
    }

    showDateEvents(date) {
        const dateKey = date.toISOString().split('T')[0];
        const eventsForDate = this.events[dateKey] || [];

        const eventListModal = document.getElementById('dateEventsModal');
        const eventListContainer = document.getElementById('dateEventsList');
        const dateDisplay = document.getElementById('selectedDateDisplay');

        // Clear previous events
        eventListContainer.innerHTML = '';
        dateDisplay.textContent = date.toLocaleDateString();

        // Populate events
        if (eventsForDate.length > 0) {
            eventsForDate.forEach((event, index) => {
                const eventItem = document.createElement('div');
                eventItem.className = 'date-event-item';
                eventItem.innerHTML = `
                    ${event.title}
                    <button onclick="calendar.deleteEvent('${dateKey}', ${index})">Delete</button>
                `;
                eventListContainer.appendChild(eventItem);
            });
        } else {
            const noEventsMsg = document.createElement('div');
            noEventsMsg.textContent = 'No events on this date';
            eventListContainer.appendChild(noEventsMsg);
        }

        eventListModal.style.display = 'block';
    }

    deleteEvent(date, index) {
        this.events[date].splice(index, 1);
        
        // Remove date key if no events left
        if (this.events[date].length === 0) {
            delete this.events[date];
        }

        // Update local storage
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        
        // Refresh display
        this.render();
        this.showDateEvents(new Date(date));
    }

    loadEvents() {
        axios.get('/get_events')
            .then(response => {
                // this.events = {};
                // response.data.forEach(event => {
                //     const startDate = new Date(event.start);
                //     const dateKey = startDate.toISOString().split('T')[0];
                //     if (!this.events[dateKey]) {
                //         this.events[dateKey] = [];
                //     }
                //     this.events[dateKey].push(event)
                // });
                this.events = response.data;
                this.render();
            })
            .catch(error => {
                console.error('error' , error);
            });
    }
}

// 현재 캘린더, 날짜 따로 표기
class Calendar_v3 {
    constructor() { 
        this.date = new Date();
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();
        this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.events = {};
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
        this.render();
    }

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

        document.getElementById('allDay').addEventListener('change', function() {
            document.getElementById('startTime').disabled = this.checked;
            document.getElementById('endTime').disabled = this.checked;
            document.getElementById('endDate').disabled = (!this.checked);
        })

        document.getElementById('addEventButton').addEventListener('click', () => this.showAddEventModal());
        document.getElementById('closeAddEventModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeEventModal').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        document.getElementById('eventForm').addEventListener('submit', (e) => this.addEvent(e));
        document.getElementById('eventUpdateForm').addEventListener('submit', (e) => this.updateEvent(e));
    }   

    render() {
        const grid = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('currentMonth');
        
        grid.innerHTML = '';
        monthDisplay.textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;
        
        // Add day headers
        this.days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const startingDay = firstDay.getDay();
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        for (let i = startingDay - 1; i >= 0; i--) {
            const prevMonthDate = new Date(this.currentYear, this.currentMonth-1, prevMonthLastDay - i);
            this.createDayCell(prevMonthDate, 'other-month');
        }
        
        const today = new Date();
        for (let i = 1; i <= totalDays; i++) {
            const currentDate = new Date(this.currentYear, this.currentMonth, i);
            const isToday = i === today.getDate() && 
                          this.currentMonth === today.getMonth() && 
                          this.currentYear === today.getFullYear();
            // isToday == True면 'today', 아니면 ''
            this.createDayCell(currentDate, isToday ? 'today' : '');
        }
        
        const remainingCells = 42 - (startingDay + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDate = new Date(this.currentYear, this.currentMonth+1, i);
            this.createDayCell(nextMonthDate, 'other-month');
        }

        // this.renderEvents();
    }

    createDayCell(date, className) {
        // 현재 월 => 'calender-cell ', 다른 월 => 'calender-cell other month', 오늘 => 'calendar-cell today'      
        const cell = document.createElement('div');
        cell.className = `calendar-cell ${className}`;
        const dateKey = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
        cell.dataset.date = dateKey;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = date.getDate();
        cell.appendChild(dateDiv);

        // add events
        if (this.events[dateKey]) {
            // console.log(this.events[dateKey]);
            this.events[dateKey].forEach(event => {
                // console.log(event);
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event-item';

                if (event.allDay) {
                    eventDiv.className += ' all-day';
                    eventDiv.style.backgroundColor = event.color || '#f1f1f1';
                    eventDiv.textContent = event.title;
                }
                else {
                    eventDiv.className += ' not-all';
                    eventDiv.style.setProperty('--event-bar-color', event.color || '#f1f1f1');
                    eventDiv.textContent = `${event.start.split('T')[1].substring(0,5)} ${event.title}`;
                }
                eventDiv.addEventListener('click', () => this.showEventDetail(event));
                cell.appendChild(eventDiv);
            })
        }

        cell.addEventListener('click', () => this.showEventDetail(date));
        document.getElementById('calendarGrid').appendChild(cell);
    }

    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    showAddEventModal() {
        const modal = document.getElementById('eventModal');
        const modalOverlay = document.getElementById('modal-overlay');
        modal.style.display = 'block';
        modalOverlay.style.display = 'block';

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = today;
    }

    closeModal() {
        document.querySelector('.modal-overlay').style.display = "none";
        document.querySelector('.modal').style.display = "none";
        document.querySelector('#dateEventsModal').style.display = "none";
    }

    addEvent(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        axios.post('/add_event', formData)
        .then((response) => {
            showToastify(response.data.message);
            this.closeModal();
            this.render();
            document.getElementById('eventForm').reset();
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
    }

    updateEvent(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        axios.post('/update_event', formData)
        .then((response) => {
            showToastify(response.data.message);
            this.closeModal();
            this.render();
            document.getElementById('eventUpdateForm').reset();
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
    }

    // showDateEvents(date) {
    //     const dateKey = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
    //     const eventsForDate = this.events[dateKey] || [];
    //     const dayList = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    //     const modalOverlay = document.getElementById('modal-overlay');
    //     const eventListModal = document.getElementById('dateEventsModal');
    //     const eventListContainer = document.getElementById('dateEventsList');
    //     const eventDetail = document.getElementById('dateEventDetail');
    //     const dateDisplay = document.getElementById('selectedDateDisplay');

    //     // Clear previous events
    //     eventListContainer.innerHTML = '';
    //     eventDetail.innerHTML = '';
    //     dateDisplay.textContent = `${date.getMonth()+1}월 ${date.getDate()}일 ${dayList[date.getDay()]}`;

    //     // Populate events
    //     if (eventsForDate.length > 0) {
    //         eventsForDate.forEach((event, index) => {
    //             const dateEventItem = document.createElement('div');
    //             const eventTitle = document.createElement('div');
    //             const eventDuration = document.createElement('div');

    //             eventTitle.className = "event-title";
    //             eventDuration.className = "event-duration";

    //             if (event.allDay) {
    //                 dateEventItem.className = 'date-event-item allDay';
    //                 eventTitle.textContent = `${event.title}`;
    //                 eventDuration.textContent = "종일";
    //             }
    //             else {
    //                 dateEventItem.className = 'date-event-item notAllDay';
    //                 eventTitle.textContent = `${event.title}`;
    //                 eventDuration.textContent = `${event.start.split('T')[1].substring(0,5)} - ${event.end.split('T')[1].substring(0,5)}`
    //             }
    //             dateEventItem.appendChild(eventTitle);
    //             dateEventItem.appendChild(eventDuration);
    //             eventListContainer.appendChild(dateEventItem);
    //             dateEventItem.addEventListener('click', () => this.showEventDetail(event));
    //         });
    //     } else {
    //         const noEventsMsg = document.createElement('div');
    //         noEventsMsg.textContent = '일정이 없습니다.';
    //         eventListContainer.appendChild(noEventsMsg);
    //     }

    //     modalOverlay.style.display = 'block';
    //     eventListModal.style.display = 'block';
    // }

    showEventDetail(event) {
        const eventUpdateForm = document.getElementById('eventUpdateForm');
        eventUpdateForm.style.display = 'flex';
    }

    deleteEvent(date, index) {
        this.events[date].splice(index, 1);
        
        // Remove date key if no events left
        if (this.events[date].length === 0) {
            delete this.events[date];
        }

        // Update local storage
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        
        // Refresh display
        this.render();
        this.showDateEvents(new Date(date));
    }

    loadEvents() {
        axios.get('/get_events')
            .then(response => {
                this.events = {};
                response.data.forEach(event => {
                    let startDate = new Date(event.start);
                    const endDate = new Date(event.end);

                    for (let date = new Date(startDate); date<=endDate; date.setDate(date.getDate()+1)) {
                        const dateKey = date.toISOString().split('T')[0];

                        if (!this.events[dateKey]) {
                            this.events[dateKey] = [];
                        }
                        this.events[dateKey].push(event)
                    }
                });
                this.render();
            })
            .catch(error => {
                console.error('error' , error);
            });
    }
}

// Initialize calendar
// new Calendar_v1();
// new Calendar_v2();
new Calendar_v3();

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

// Toastify
function showToastify(message) {
    Toastify({
        text: message,
        duration: 2000,
        gravity: "top",
        position: "center",
        style: {
            background: "black",
            color: "white",
            borderRadius: "10px"
        }
    }).showToast();
}