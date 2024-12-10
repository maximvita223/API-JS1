let scheduleData;

function renderSchedule(schedule) {
    const scheduleContainer = document.getElementById('schedule');
    scheduleContainer.innerHTML = '';

    schedule.forEach((classItem, index) => {
        const classElement = document.createElement('div');
        classElement.className = 'card mb-3';
        classElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${classItem.name}</h5>
                <p class="card-text">Время: ${new Date(classItem.time).toLocaleString()}</p>
                <p class="card-text">Макс. участников: ${classItem.max_participants}</p>
                <p class="card-text">Текущих участников: ${classItem.current_participants}</p>
                <button class="btn btn-primary mr-2" onclick="enroll(${index})" id="enroll-${index}" ${classItem.current_participants >= classItem.max_participants ? 'disabled' : ''}>Записаться</button>
                <button class="btn btn-danger" onclick="unenroll(${index})" id="unenroll-${index}" ${classItem.current_participants <= 0 ? 'disabled' : ''}>Отменить запись</button>
            </div>
        `;
        scheduleContainer.appendChild(classElement);
    });
}

function enroll(index) {
    if (scheduleData.schedule[index].current_participants < scheduleData.schedule[index].max_participants) {
        scheduleData.schedule[index].current_participants++;
        saveScheduleToLocalStorage(scheduleData);
        renderSchedule(scheduleData.schedule);
        showNotification(`Вы успешно записались на "${scheduleData.schedule[index].name}"`);
        document.getElementById(`enroll-${index}`).disabled = true;
        document.getElementById(`unenroll-${index}`).disabled = false;
    }
}

function unenroll(index) {
    if (scheduleData.schedule[index].current_participants > 0) {
        scheduleData.schedule[index].current_participants--;
        saveScheduleToLocalStorage(scheduleData);
        renderSchedule(scheduleData.schedule);
        showNotification(`Вы успешно отменили запись на "${scheduleData.schedule[index].name}"`);
        document.getElementById(`enroll-${index}`).disabled = false;
        document.getElementById(`unenroll-${index}`).disabled = true;
    }
}

function saveScheduleToLocalStorage(schedule) {
    localStorage.setItem('scheduleData', JSON.stringify(schedule));
}

function loadScheduleFromLocalStorage() {
    const storedSchedule = localStorage.getItem('scheduleData');
    return storedSchedule ? JSON.parse(storedSchedule) : null;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show';
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const storedSchedule = loadScheduleFromLocalStorage();
    if (storedSchedule) {
        scheduleData = storedSchedule;
        renderSchedule(scheduleData.schedule);
    } else {
        fetch('http://localhost:8080/schedule.json')
            .then(response => response.json())
            .then(data => {
                scheduleData = data;
                saveScheduleToLocalStorage(scheduleData);
                renderSchedule(scheduleData.schedule);
            })
            .catch(error => console.error('Error loading the schedule:', error));
    }
});