const toDoAlert = document.querySelector('.todolist__header-title');
const toDoInput = document.querySelector('.todo-input');
const toDoTasksLeft = document.querySelector('.todolist__header-remaining');
const listContainer = document.querySelector('.todolist__container');
const newTaskForm = document.querySelector('[data-new-task]');
// --- aside buttons --- //
const addTaskBtn = document.querySelector('#add');
const clearCompletedBtn = document.querySelector('#confirm');
const clearAllBtn = document.querySelector('#clear');

// --- functions --- //
function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false }
}

function addTask(e) {
    e.preventDefault();
    const task = createTask(toDoInput.value);
    if (task.name == null || task.name === '') {
        displayAlert('Please enter value', 'failure');
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
    listContainer.appendChild(taskElem);
    toDoInput.value = '';
    displayAlert(`added: ${task.name}`, 'success');
    addToLocalStorage(task);
    taskCount();
}

function deleteTask(e){
    const taskElem = e.currentTarget.parentElement; 
    const taskID = taskElem.dataset.id;
    listContainer.removeChild(taskElem);    
    displayAlert(`removed: ${taskElem.firstChild.innerText}`, 'failure');
    removeFromLocalStorage(taskID);
    taskCount();
}

function deleteAll(){
    const tasks = document.querySelectorAll('.todolist__container-item');
    if (tasks.length > 0) {
        tasks.forEach(task => {
            listContainer.removeChild(task);
        });
        displayAlert('all tasks removed', 'failure');
        localStorage.removeItem('todo-list');
        taskCount();
    } else displayAlert('no tasks to remove', 'failure');
}

function deleteCompleted(){
    const tasks = document.querySelectorAll('.todolist__container-item');
    const tasksCompleted = [...tasks].filter(task => task.classList.contains('completed'))
    if (tasksCompleted.length > 0){
        tasksCompleted.forEach(task => {
            removeFromLocalStorage(task.dataset.id);
            listContainer.removeChild(task);
        })
        displayAlert('completed tasks removed', 'failure');
    } else displayAlert('no completed tasks to remove', 'failure');
}

function taskCount(){
    const tasks = document.querySelectorAll('.todolist__container-item');
    const incompleteTasks = [...tasks].filter(task => !task.classList.contains('completed')).length;
    const taskText = incompleteTasks === 1
        ? 'task'
        : 'tasks';
    toDoTasksLeft.innerText = `${incompleteTasks} ${taskText} remaining`;
}

function displayAlert(text, action){
    toDoAlert.textContent = text;
    toDoAlert.classList.add(action);
    setTimeout(() => {
        toDoAlert.textContent = 'to-do list';
        toDoAlert.classList.remove(action);
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
    taskCount();
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
    listContainer.appendChild(taskElem);
}

// --- event listeners --- //
addTaskBtn.addEventListener('click', addTask);
newTaskForm.addEventListener('submit', addTask);
clearCompletedBtn.addEventListener('click', deleteCompleted);
clearAllBtn.addEventListener('click', deleteAll);

window.addEventListener("DOMContentLoaded", setupTasks);

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        e.target.classList.toggle('completed');
        editLocalStorage(e.target.dataset.id);
    }
    if (e.target.tagName.toLowerCase() === 'span') {
        e.target.parentElement.classList.toggle('completed');
        editLocalStorage(e.target.parentElement.dataset.id);
    }
    taskCount();
});