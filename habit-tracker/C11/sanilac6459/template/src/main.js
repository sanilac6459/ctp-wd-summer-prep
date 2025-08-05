let habits = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('habit-form');
  const container = document.querySelector('.habit-container');

  loadHabits();
  renderHabits(container);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value.trim();
    const target = parseInt(document.getElementById('habit-target').value);

    // habit object
    if (name && category && target > 0) {
        addHabit({
        id: Date.now(),
        name,
        category,
        target,
        streak: 0,
        longestStreak: 0,
        completions: [],
        lastCompleted: null,
        skippedDate: null
      });
        form.reset();
        renderHabits(container);
        saveHabits();
    } 
    else {
      alert('Please fill in all fields correctly.');
    }
  });
});

// load habits from localStorage
function loadHabits() {
  const saved = localStorage.getItem('habits');
  habits = saved ? JSON.parse(saved) : [];

  habits.forEach(habit => {
    if (!habit.completions) habit.completions = [];
    if (!habit.longestStreak) habit.longestStreak = 0;
  });
}

// save habits to localStorage
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

// rendering habit cards
function renderHabits(container) {
  container.innerHTML = '';
  habits.forEach(habit => {
    container.appendChild(createHabitCard(habit));
  });
}

// generate habit cards as user add them
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
    <button class="btn-show-history">Show History</button>
    <div class="habit-history" style="display: none; margin-top: 8px; font-size: 13px; color: #333;">
      ${habit.completions && habit.completions.length > 0 ? habit.completions.join('<br>') : 'No completions yet'}
    </div>
  </div>
  <div class="habit-footer">
    <button class="btn-complete">Mark Complete</button>
    <button class="btn-skip">Skip Today</button>
  </div>
`;

  // handles "Show History" button
  const toggleBtn = card.querySelector('.btn-show-history');
  const historyDiv = card.querySelector('.habit-history');

  toggleBtn.addEventListener('click', () => {
    if (historyDiv.style.display === 'none') {
      historyDiv.style.display = 'block';
      toggleBtn.textContent = 'Hide History';
    } else {
      historyDiv.style.display = 'none';
      toggleBtn.textContent = 'Show History';
    }
  });

  // handles "Mark Complete" button
  card.querySelector('.btn-complete').addEventListener('click', () => {
    markHabitComplete(habit);
  });

  // handles"Skip Today" button
  card.querySelector('.btn-skip').addEventListener('click', () => {
    skipHabitToday(habit);
  });

  // handles "Edit" button
  card.querySelector('.btn-edit').onclick = () => editHabit(habit.id);

  // handles trash icon
  card.querySelector('.delete-icon').onclick = () => {
    if (confirm(`Are you sure you want to delete ${habit.name}? This action can't be undone.`)) {
      card.remove();
      deleteHabit(habit.id);
    }
  };

  return card;
}

// adding habit form functionality
function addHabit(habit) {
  habits.push(habit);
  saveHabits();
}

// mark complete button functionality
function markHabitComplete(habit) {
  const today = new Date().toISOString().split('T')[0];

  // PREVENT USER FROM SPAMMING, ACCURATELY MARKS COMPLETE FOR TODAY
  // if (habit.lastCompleted === today) {
  //   alert("You already completed this!");
  //   return;
  // }

  // if (habit.skippedDate === today) {
  //   alert("You already skipped this today!");
  //   return;
  // }

  habit.lastCompleted = today;
  habit.streak += 1;
  habit.skippedDate = null;

  // calculated streaks
  if (!habit.completions.includes(today)) {
    habit.completions.push(today);
  }

  if (habit.streak > habit.longestStreak) {
    habit.longestStreak = habit.streak;
  }

  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
  addEventListeners();
}

// trash icon functionality
function deleteHabit(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) {
    return;
  }
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
  addEventListeners();
}

// edit habit and catgeory functionality
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

// skip button functionality
function skipHabitToday(habit) {
  const today = new Date().toISOString().split('T')[0];

  if (!confirm(`Are you sure you want to skip ${habit.name}?`)) {
    return;
  }

  // PREVENT USER FROM SPAMMING, ACCURATELY SKIPS FOR TODAY
  // if (habit.skippedDate === today) {
  //   alert("You already skipped this today!");
  //   return;
  // }

  // if (habit.lastCompleted === today) {
  //   alert("You already completed this!");
  //   return;
  // }

  habit.skippedDate = today;
  habit.lastCompleted = null;

  saveHabits();
  renderHabits(document.querySelector('.habit-container'));
  addEventListeners();
}
