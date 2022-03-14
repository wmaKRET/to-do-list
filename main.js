const tasksAlert = document.querySelector('.todolist__header-title');
const tasksForm = document.querySelector('[data-new-task]');
const tasksInput = document.querySelector('.todo-input');
const tasksRemaining = document.querySelector('.todolist__header-remaining');
const tasksContainer = document.querySelector('.todolist__container');
// --- aside buttons --- //
const taskAddBtn = document.querySelector('#add');
const taskClearCompletedBtn = document.querySelector('#confirm');
const taskClearAllBtn = document.querySelector('#clear');

// --- functions --- //
function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false }
}

function addTask(e) {
    e.preventDefault();
    const task = createTask(tasksInput.value);
    if (task.name == null || task.name === '') {
        displayAlert('please enter value', 'failure');
        return;
    }
    const taskElem = document.createElement('li');
    let attribute = document.createAttribute('data-id');
    attribute.value = task.id;
    taskElem.setAttributeNode(attribute);
    taskElem.classList.add('todolist__container-item');
    taskElem.innerHTML = 
        `<span class="item-text">${task.name}</span><span class="item-close">X</span>`;
    const deleteBtn = taskElem.querySelector('.item-close');
    deleteBtn.addEventListener('click', deleteTask);
    tasksContainer.appendChild(taskElem);
    tasksInput.value = '';
    displayAlert(`${task.name}`, 'success');
    addToLocalStorage(task);
    taskRemain();
}

function deleteTask(e){
    const taskElem = e.currentTarget.parentElement; 
    tasksContainer.removeChild(taskElem);   
    displayAlert(`${taskElem.firstChild.innerText}`, 'failure');
    removeFromLocalStorage(taskElem.dataset.id);
    taskRemain();
}

function deleteAll(){
    const tasks = document.querySelectorAll('.todolist__container-item');
    if (tasks.length > 0) {
        tasks.forEach(task => {
            tasksContainer.removeChild(task);
        });
        displayAlert('all tasks deleted', 'alert');
        localStorage.removeItem('todo-list');
        taskRemain();
    } else displayAlert('there are no tasks to delete', 'failure');
}

function deleteCompleted(){
    const tasks = document.querySelectorAll('.todolist__container-item');
    const tasksCompleted = [...tasks].filter(task => task.classList.contains('completed'))
    if (tasksCompleted.length > 0){
        tasksCompleted.forEach(task => {
            tasksContainer.removeChild(task);
            removeFromLocalStorage(task.dataset.id);
        })
        displayAlert('completed tasks deleted', 'alert');
    } else displayAlert('there are no completed tasks to delete', 'failure');
}

function taskRemain(){
    const tasks = document.querySelectorAll('.todolist__container-item');
    const incompleteTasks = [...tasks].filter(task => !task.classList.contains('completed')).length;
    const taskText = incompleteTasks === 1
        ? 'task'
        : 'tasks';
    tasksRemaining.innerText = `${incompleteTasks} ${taskText} remaining`;
}

function displayAlert(text, action){
    tasksAlert.textContent = text;
    tasksAlert.classList.add(action);
    setTimeout(() => {
        tasksAlert.textContent = 'to-do list';
        tasksAlert.classList.remove(action);
    }, 1500);
}

// --- local storage --- //
function addToLocalStorage(task) {
    let tasks = getLocalStorage();
    tasks.push(task);
    localStorage.setItem('todo-list', JSON.stringify(tasks));
}

function getLocalStorage(){
    return localStorage.getItem('todo-list')
        ? JSON.parse(localStorage.getItem('todo-list'))
        : [];
}

function removeFromLocalStorage(id) {
    let tasks = getLocalStorage();
    tasks = tasks.filter(task => {
        if (task.id !== id) {
            return task;
        }
    });
    localStorage.setItem('todo-list', JSON.stringify(tasks));
}

function editLocalStorage(id) { // edit "complete" value for selected task
    let tasks = getLocalStorage();
    tasks = tasks.filter(task => {
        if (task.id === id) {
            task.complete = !task.complete;
            return task;
        } else return task;
    });
    localStorage.setItem('todo-list', JSON.stringify(tasks));
}

// --- setup/render tasks --- //
function setupTasks(){
    let tasks = getLocalStorage();
    if (tasks.length > 0) {
        tasks.forEach((task) => {
            renderTasks(task.id, task.name, task.complete);
        });
    }
    taskRemain();
}

function renderTasks(id, name, complete) {
    const taskElem = document.createElement('li');
    let attribute = document.createAttribute('data-id');
    attribute.value = id;
    taskElem.setAttributeNode(attribute);
    taskElem.classList.add('todolist__container-item');
    if (complete === true) taskElem.classList.add('completed');
    taskElem.innerHTML = 
        `<span class="item-text">${name}</span><span class="item-close">X</span>`;
    const deleteBtn = taskElem.querySelector('.item-close');
    deleteBtn.addEventListener('click', deleteTask);
    tasksContainer.appendChild(taskElem);
}

// --- event listeners --- //
window.addEventListener("DOMContentLoaded", setupTasks);

taskAddBtn.addEventListener('click', addTask);
tasksForm.addEventListener('submit', addTask);
taskClearCompletedBtn.addEventListener('click', deleteCompleted);
taskClearAllBtn.addEventListener('click', deleteAll);

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        e.target.classList.toggle('completed');
        editLocalStorage(e.target.dataset.id);
    }
    if (e.target.tagName.toLowerCase() === 'span') {
        e.target.parentElement.classList.toggle('completed');
        editLocalStorage(e.target.parentElement.dataset.id);
    }
    taskRemain();
});