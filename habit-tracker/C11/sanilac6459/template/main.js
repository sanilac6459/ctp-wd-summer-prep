let habits = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('habit-form');
  const container = document.querySelector('.habit-container');

  loadHabits(); // load saved habits from localStorage
  renderHabits(container);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value.trim();
    const target = parseInt(document.getElementById('habit-target').value);

    if (name && category && target > 0) {
      addHabit({ id: Date.now(), name, category, target, streak: 0, lastCompleted: null });
      form.reset();
      renderHabits(container);
      saveHabits();
    } else {
      alert('Please fill in all fields correctly.');
    }
  });
});

function loadHabits() {
  const saved = localStorage.getItem('habits');
  habits = saved ? JSON.parse(saved) : [];
}

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function renderHabits(container) {
  container.innerHTML = '';
  habits.forEach(habit => {
    container.appendChild(createHabitCard(habit));
  });
}

function createHabitCard(habit) {
  const card = document.createElement('div');
  card.className = 'habit-card';
  card.dataset.id = habit.id;

  const progressPercent = habit.target ? Math.min((habit.streak / habit.target) * 100, 100) : 0;
  const lastCompletedText = habit.lastCompleted ? `Last completed: ${habit.lastCompleted}` : 'Last completed: Never';

  card.innerHTML = `
  <div class="delete-icon" title="Delete Habit">
    <img src="images/trash-can-icon.png" alt="Delete" />
  </div>
  <div class="habit-header">
    <h3 class="habit-title">${habit.name}</h3>
    <div class="right-side">
      <span class="habit-category">${habit.category}</span>
      <button class="btn-edit">Edit</button>
    </div>
  </div>
  <div class="habit-body">
    <div class="streak-info">
      <span class="streak-number">${habit.streak}</span>
      <span class="streak-label">day(s) streak</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${progressPercent}%"></div>
    </div>
    <p class="habit-time">${lastCompletedText}</p>
  </div>
  <div class="habit-footer">
    <button class="btn-complete">Mark Complete</button>
    <button class="btn-skip">Skip Today</button>
  </div>
`;
  card.querySelector('.btn-complete').addEventListener('click', () => {
  markHabitComplete(habit);
});

card.querySelector('.btn-skip').addEventListener('click', () => {
  skipHabitToday(habit);
});
  card.querySelector('.btn-edit').onclick = () => editHabit(habit.id);
  card.querySelector('.delete-icon').onclick = () => {
  if (confirm(`Are you sure you want to delete ${habit.name}? This action can't be undone.`)) {
    card.remove();
    deleteHabit(habit.id);
  }
};

  return card;
}

function addHabit(habit) {
  habits.push(habit);
  saveHabits();
}

function markHabitComplete(habit) {
  const today = new Date().toISOString().split('T')[0];

  if (habit.lastCompleted === today) {
    alert("You already completed this!");
    return;
  }

  if (habit.skippedDate === today) {
    alert("You already skipped this today!");
    return;
  }

  habit.lastCompleted = today;
  habit.streak += 1;
  habit.skippedDate = null; // clear skip if they complete

  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
}


function deleteHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) {
    return;
  }
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
}

function editHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) {
    return;
  }

  const newName = prompt('Edit habit name:', habit.name);
  const newCategory = prompt('Edit habit category:', habit.category);

  if (newName !== null && newName !== '') {
    habit.name = newName;
  }

  if (newCategory !== null && newCategory !== '') {
    habit.category = newCategory;
  }

  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
}

function skipHabitToday(habit) {
  const today = new Date().toISOString().split('T')[0];

  if (habit.skippedDate === today) {
    alert("You already skipped this today!");
    return;
  }

  if (habit.lastCompleted === today) {
    alert("You already completed this!");
    return;
  }

  if (confirm(`Are you sure you want to skip ${habit.name}?`)) {
    habit.skipped = today;
    saveHabits();
    renderHabits(document.querySelector('.habit-container'));
  }

  habit.streak = 0;
  habit.skippedDate = today;
  habit.lastCompleted = null;

  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
}