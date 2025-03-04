document.addEventListener("DOMContentLoaded", function () {
    fetchTasks();

    document.getElementById("filter").addEventListener("change", function () {
        fetchTasks(this.value);
    });

    document.getElementById("task-form").addEventListener("submit", function (e) {
        e.preventDefault();

        let title = document.getElementById("title").value.trim();
        let description = document.getElementById("description").value.trim();
        let due_date = document.getElementById("due_date").value.trim();

        if (!title || !description || !due_date) {
            alert("All fields are required!");
            return;
        }

        let taskData = { title, description, due_date };

        fetch("tasks.php", {
            method: "POST",
            body: JSON.stringify(taskData),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                fetchTasks();
                document.getElementById("task-form").reset();
            }
        })
        .catch(error => console.error("Error:", error));
    });
});

function fetchTasks(status = "") {
    let url = "tasks.php";
    if (status) url += "?status=" + status;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let taskList = document.getElementById("task-list");
            taskList.innerHTML = "";

            data.forEach(task => {
                let li = document.createElement("li");
                li.innerHTML = `
                    <span><strong>${task.title}</strong> - ${task.status} - Due: ${task.due_date}</span>
                    <div>
                        <select onchange="updateStatus(${task.id}, this.value)">
                            <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
                            <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
                            <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
                        </select>
                        <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching tasks:", error));
}

function updateStatus(id, status) {
    fetch("tasks.php?id=" + id, {
        method: "PUT",
        body: "status=" + encodeURIComponent(status),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            fetchTasks();
        }
    })
    .catch(error => console.error("Error updating task:", error));
}

function deleteTask(id) {
    if (confirm("Are you sure?")) {
        fetch("tasks.php?id=" + id, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Error: " + data.error);
                } else {
                    fetchTasks();
                }
            })
            .catch(error => console.error("Error deleting task:", error));
    }
}
