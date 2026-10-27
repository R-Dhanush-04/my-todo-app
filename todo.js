let id = 1;

let tasks = [];

try {
    let savedTasks = JSON.parse(localStorage.getItem("myTasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(function (task) {
            return task &&
                Number.isSafeInteger(task.id) &&
                typeof task.name === "string" &&
                typeof task.completed === "boolean";
        });
    }
} catch (error) {
    tasks = [];
}

let editingId = null;
let toastTimer;


/* Notification */

let toast = document.getElementById("toast");

function showMessage(message, type = "success") {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.className = "toast " + type + " show";

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}


/* Save to Local Storage */

function saveTasks() {
    try {
        localStorage.setItem("myTasks", JSON.stringify(tasks));
        return true;
    } catch (error) {
        showMessage("Unable to save tasks in this browser!", "error");
        return false;
    }
}


/* Add Task */

function addTask() {
    let input = document.getElementById("task-name");
    let taskname = input.value.trim();

    if (taskname === "") {
        showMessage("Please enter a task name!", "error");
        input.focus();
        return;
    }

    if (taskname.length > 200) {
        showMessage("Task must be under 200 characters!", "error");
        return;
    }

    let newTask = {
        id: id++,
        name: taskname,
        completed: false
    };

    tasks.push(newTask);

    if (!saveTasks()) {
        tasks.pop();
        id--;
        return;
    }

    displayTasks();

    input.value = "";
    input.focus();

    showMessage("Task added successfully!");
}


/* Display Tasks */

function displayTasks() {
    let taskContainer = document.querySelector(".tasks");

    taskContainer.innerHTML = "";

    if (tasks.length === 0) {
        let emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-message";
        emptyMessage.textContent =
            "No tasks yet. Add your first task!";

        taskContainer.appendChild(emptyMessage);
    }

    tasks.forEach(function (task, index) {
        let newTask = document.createElement("div");
        newTask.className = "task";

        let checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", function () {
            completed(task.id, checkbox.checked);
        });

        let taskpara = document.createElement("p");

        taskpara.textContent = (index + 1) + ". " + task.name;

        if (task.completed) {
            taskpara.classList.add("completed");
        }

        let editButton = document.createElement("button");

        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editTask(task.id);
        });

        let deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        newTask.appendChild(checkbox);
        newTask.appendChild(taskpara);
        newTask.appendChild(editButton);
        newTask.appendChild(deleteButton);

        taskContainer.appendChild(newTask);
    });

    updateStats();
}


/* Update Counts */

function updateStats() {
    let total = tasks.length;

    let completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;

    document.getElementById("total-count").textContent = total;

    document.getElementById("completed-count").textContent =
        completedCount;

    document.getElementById("pending-count").textContent =
        total - completedCount;
}


/* Complete Task */

function completed(taskId, isChecked) {
    let task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (!task) {
        return;
    }

    let oldStatus = task.completed;

    task.completed = isChecked;

    if (!saveTasks()) {
        task.completed = oldStatus;
        displayTasks();
        return;
    }

    displayTasks();

    showMessage(
        isChecked ? "Task completed!" : "Task marked as pending!"
    );
}


/* Edit Task */

function editTask(taskId) {
    let task = tasks.find(function (item) {
        return item.id === taskId;
    });

    if (!task) {
        return;
    }

    editingId = taskId;

    let modal = document.getElementById("edit-modal");
    let input = document.getElementById("edit-input");

    input.value = task.name;
    modal.hidden = false;

    input.focus();
    input.select();
}


/* Save Edited Task */

function saveEdit() {
    let input = document.getElementById("edit-input");
    let newName = input.value.trim();

    if (newName === "") {
        showMessage("Task name cannot be empty!", "error");
        input.focus();
        return;
    }

    if (newName.length > 200) {
        showMessage("Task must be under 200 characters!", "error");
        input.focus();
        return;
    }

    let task = tasks.find(function (item) {
        return item.id === editingId;
    });

    if (!task) {
        closeEdit();
        return;
    }

    if (task.name === newName) {
        closeEdit();
        showMessage("No changes were made!");
        return;
    }

    let oldName = task.name;

    task.name = newName;

    if (!saveTasks()) {
        task.name = oldName;
        return;
    }

    closeEdit();
    displayTasks();

    showMessage("Task updated successfully!");
}


/* Close Edit Popup */

function closeEdit() {
    document.getElementById("edit-modal").hidden = true;

    editingId = null;

    document.getElementById("edit-input").value = "";
}

document.getElementById("save-edit").addEventListener(
    "click",
    saveEdit
);

document.getElementById("cancel-edit").addEventListener(
    "click",
    closeEdit
);


/* Delete Task */

function deleteTask(taskId) {
    let confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    let oldTasks = tasks;

    tasks = tasks.filter(function (task) {
        return task.id !== taskId;
    });

    if (!saveTasks()) {
        tasks = oldTasks;
        return;
    }

    displayTasks();

    showMessage("Task deleted successfully!");
}


/* Keyboard Events */

document.getElementById("task-name").addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            addTask();
        }
    }
);

document.getElementById("edit-input").addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            saveEdit();
        }

        if (event.key === "Escape") {
            closeEdit();
        }
    }
);

document.getElementById("edit-modal").addEventListener(
    "click",
    function (event) {
        if (event.target === this) {
            closeEdit();
        }
    }
);


/* Load Saved Tasks */

id = tasks.reduce(function (maxId, task) {
    return Math.max(maxId, task.id);
}, 0) + 1;

displayTasks();