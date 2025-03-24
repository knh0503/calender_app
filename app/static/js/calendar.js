class mapSearchAPI {
    constructor(options) { 
        this.mapID = options.mapID;
        this.inputID = options.inputID;
        this.inputDataID = options.inputDataID;
        this.buttonID = options.buttonID;
        this.dropdownID = options.dropdownID;

        this.map = null;
        this.markers = [];
        this.infoWindows = [];
        this.center = [];

        this.init();
    }

    init() {
        this.getMap();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById(this.dropdownID).addEventListener('change', (e) => {
            if (e.target.value) {
                const selectedLocation = JSON.parse(e.target.value);
                document.getElementById(this.inputID).value = selectedLocation.title;
                document.getElementById(this.inputDataID).value = e.target.value;

                selectedLocation = this.searchPlace(selectedLocation);
            }
        });
        document.getElementById(this.buttonID).addEventListener('click', ()=> this.mapSearch());
    }  

    getMap() {
        this.map = new naver.maps.Map(this.mapID, {
            center: new naver.maps.LatLng(37.5665, 126.9780), // 초기 위치 (서울)
            zoom: 13
        });
    }

    setLocation(lat,lng) {
        this.map.setCenter(lat, lng);
    }

    searchPlace(place) {    
        naver.maps.Service.geocode({ query: place.address }, (status, response) => {
            if (status !== naver.maps.Service.Status.OK) {
                return showToastify("주소를 불러올 수 없습니다");
            }
    
            if (!response.v2.addresses || response.v2.addresses.length === 0) {
                return showToastify("검색 결과가 없습니다.")
            }
    
            var result = response.v2.addresses[0];
            var latlng = new naver.maps.LatLng(result.y, result.x);

            this.createMarkerAndInfo(latlng, place);

            place.mapx = result.x;
            place.mapy = result.y;
            return place;
        });
    }

    mapSearch() {
        var place = document.getElementById(this.inputID).value;
        const dropdown = document.getElementById(this.dropdownID);
    
        dropdown.innerHTML = '<option value="">검색 결과를 선택하세요</option>';
    
        if (!place) {
            showToastify("장소를 입력해주세요");
            return;
        }

        const data = {place : place};

        axios.post('/mapSearch', data)
        .then((response) => {
            if (!response.data.flag) {
                return showToastify(response.data.message);
            }
            if (response.data.stores.length > 0) {
                dropdown.classList.remove('hidden');
    
                response.data.stores.forEach(store => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        title : store.title,
                        address : store.roadAddress || store.address,
                        mapx : store.mapx,
                        mapy : store.mapy
                    });
                    option.textContent = `${store.title}`;
                    dropdown.appendChild(option);
                });
            }
            else {
                showToastify('검색 결과가 없습니다.');
            }
        })
        .catch((error) => {
            console.error('Error: ', error);
            showToastify('검색 중 오류가 발생했습니다.');
        });
    }

    createMarkerAndInfo(latlng, place) {
        // this.clearMarkers();

        const marker = new naver.maps.Marker({
            position: latlng,
            map: this.map
        });

        this.map.setCenter(latlng);
        this.map.setZoom(12);

        const infoWindow = new naver.maps.InfoWindow({
            content: this.createInfoWindowContent(place)
        });

        infoWindow.open(this.map, latlng)



        this.markers.push(marker);
        this.infoWindows.push(infoWindow);

        

        infoWindow.open(this.map, marker);
    }

    createInfoWindowContent(location) {
        return `
            <div style="padding: 5px; width: 150px;">
                <p style="font-weight : bold; font-size:0.7em">${location.title}</p>
                <p style="font-size: 0.5em;">주소: ${location.roadAddress || location.address}</p>
            </div>
        `;
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.infoWindows.forEach(infoWindow => {
            infoWindow.close();
        });
        this.markers = [];
        this.infoWindows = [];
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
        this.newMap = new mapSearchAPI({
            mapID: 'newMap',
            inputID: 'newLocation',
            inputDataID: 'newLocationData',
            buttonID: 'newLocationButton',
            dropdownID: 'newLocationDropdown'
        });
        this.map = new mapSearchAPI({
            mapID: 'map',
            inputID: 'location',
            inputDataID: 'locationData',
            buttonID: 'locationButton',
            dropdownID: 'locationDropdown'
        });

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

        document.getElementById('newAllDay').addEventListener('change', function() {
            document.getElementById('newStartTime').disabled = this.checked;
            document.getElementById('newEndTime').disabled = this.checked;
            document.getElementById('newEndDate').disabled = (!this.checked);
        })

        document.getElementById('addEventButton').addEventListener('click', () => this.showAddEventModal());
        document.getElementById('closeAddEventModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeEventModal').addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
        document.getElementById('eventForm').addEventListener('submit', (e) => this.addEvent(e));
        document.getElementById('prevDiv').addEventListener('click', () => {
            document.getElementById('dateEventsModal').style.display = "block";
            document.getElementById('eventUpdateModal').style.display = "none";
        });
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
            this.events[dateKey].forEach(event => {
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
                cell.appendChild(eventDiv);
            })
        }

        cell.addEventListener('click', () => this.showDateEvents(date));
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
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        })
    }

    addEvent(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        axios.post('/add_event', formData)
        .then((response) => {
            showToastify(response.data.message);
            if (response.data.flag == true) {
                this.closeModal();
                this.loadEvents();
                this.render();
                document.getElementById('eventForm').reset();
            }
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
            if (response.data.flag == true){
                this.closeModal();
                this.render();
                document.getElementById('eventUpdateForm').reset();
            }
        })
        .catch((error) => {
            console.error('Error: ', error);
        });
    }

    showDateEvents(date) {
        const dateKey = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
        const eventsForDate = this.events[dateKey] || [];
        const dayList = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

        const modalOverlay = document.getElementById('modal-overlay');
        const eventListModal = document.getElementById('dateEventsModal');
        const eventListContainer = document.getElementById('dateEventsList');
        const dateDisplay = document.getElementById('selectedDateDisplay');
        const eventUpdateModal = document.getElementById('eventUpdateModal');

        // Clear previous events
        eventUpdateModal.style.display = "none";
        eventListContainer.innerHTML = '';
        dateDisplay.textContent = `${date.getMonth()+1}월 ${date.getDate()}일 ${dayList[date.getDay()]}`;

        // Populate events
        if (eventsForDate.length > 0) {
            eventsForDate.forEach((event, index) => {
                const dateEventItem = document.createElement('div');
                const eventTitle = document.createElement('div');
                const eventDuration = document.createElement('div');

                eventTitle.className = "event-title";
                eventDuration.className = "event-duration";
                dateEventItem.style.setProperty('--event-bar-color', event.color || '#f1f1f1');

                if (event.allDay) {
                    dateEventItem.className = 'date-event-item allDay';
                    eventTitle.textContent = `${event.title}`;
                    eventDuration.textContent = "종일";
                }
                else {
                    dateEventItem.className = 'date-event-item notAllDay';
                    eventTitle.textContent = `${event.title}`;
                    eventDuration.textContent = `${event.start.split('T')[1].substring(0,5)} - ${event.end.split('T')[1].substring(0,5)}`
                }
                dateEventItem.appendChild(eventTitle);
                dateEventItem.appendChild(eventDuration);
                eventListContainer.appendChild(dateEventItem);
                dateEventItem.addEventListener('click', () => this.showEventDetail(event));
            });
        } else {
            const noEventsMsg = document.createElement('div');
            noEventsMsg.textContent = '일정이 없습니다.';
            eventListContainer.appendChild(noEventsMsg);
        }

        modalOverlay.style.display = 'block';
        eventListModal.style.display = 'block';
    }

    showEventDetail(event) {
        document.getElementById('dateEventsModal').style.display = "none";
        document.getElementById('eventUpdateModal').style.display = "block";

        document.getElementById('newEventID').value = event.id;
        document.getElementById('newEventTitle').value = event.title;

        if (event.allDay == true) {
            document.getElementById('newAllDay').checked = true;
            document.getElementById('newStartTime').disabled = true;
            document.getElementById('newEndTime').disabled = true;
            document.getElementById('newEndDate').disabled = false;
        } else {
            document.getElementById('newAllDay').checked = false;
            document.getElementById('newStartTime').disabled = false;
            document.getElementById('newEndTime').disabled = false;
            document.getElementById('newEndDate').disabled = true;
        }

        document.getElementById('newStartTime').value = event.start.split('T')[1].substring(0,5);
        document.getElementById('newEndTime').value = event.end.split('T')[1].substring(0,5);
        document.getElementById('newStartDate').value = event.start.split('T')[0];
        document.getElementById('newEndDate').value = event.end.split('T')[0];
        document.getElementById('newDescription').value = event.description;
        document.getElementById('newCategory').value = event.category;

        const selectedLocation = JSON.parse(event.location);
        document.getElementById('newLocation').value = selectedLocation.title;

        var latlng = new naver.maps.LatLng(37.5665, 126.9780);
        var latlng = new naver.maps.LatLng(selectedLocation.mapy, selectedLocation.mapx);

        console.log(latlng, selectedLocation);
        this.newMap.createMarkerAndInfo(latlng, selectedLocation);

        document.getElementById('newAlarm').value = event.alarm;
        document.getElementById('newColor').value = event.color;
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
                    let endDate = new Date(event.end);

                    startDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
                    endDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

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


