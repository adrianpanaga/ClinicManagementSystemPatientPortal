<template>
  <div class="choose-date">
    <div class="step-header">
      <i class="fas fa-calendar-alt step-header-icon"></i> <!-- Font Awesome icon -->
      <h2>Step 3: Select a Date</h2>
    </div>
    <p>Please choose a date for your appointment.</p>

    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="prevMonth" class="nav-button">&lt;</button>
        <span class="current-month-year">{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="nextMonth" class="nav-button">&gt;</button>
      </div>
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="calendar-days">
        <div
          v-for="day in daysInMonth"
          :key="day ? day.dateString : 'empty-' + Math.random()"
          class="day"
          :class="{
            'empty': !day,
            'today': day && isToday(day.date),
            'selected': day && isSelected(day.date),
            'past': day && isPast(day.date),
            'available': day && !isPast(day.date)
          }"
          @click="day && !isPast(day.date) && selectDate(day.date)"
        >
          {{ day ? day.dayOfMonth : '' }}
        </div>
      </div>
    </div>

    <div class="navigation-buttons">
      <button @click="emitNavigation('back')" class="back-button">Back</button>
      <button @click="emitNavigation('next')" :disabled="!selectedDate" class="next-button">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ChooseDate',
  props: {
    initialDate: {
      type: [String, Date],
      default: null,
    },
  },
  setup(props, { emit }) {
    const today = new Date();
    const currentMonth = ref(today.getMonth());
    const currentYear = ref(today.getFullYear());
    const selectedDate = ref(props.initialDate ? new Date(props.initialDate) : new Date(today));

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentMonthName = computed(() => monthNames[currentMonth.value]);

    const daysInMonth = computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const numDays = lastDayOfMonth.getDate();

      const startWeekday = firstDayOfMonth.getDay();

      const days = [];

      for (let i = 0; i < startWeekday; i++) {
        days.push(null);
      }

      for (let i = 1; i <= numDays; i++) {
        const date = new Date(year, month, i);
        days.push({
          dayOfMonth: i,
          date: date,
          dateString: date.toISOString().split('T')[0]
        });
      }
      return days;
    });

    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
      } else {
        currentMonth.value--;
      }
    };

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
      } else {
        currentMonth.value++;
      }
    };

    const selectDate = (date) => {
      selectedDate.value = date;
    };

    const isToday = (date) => {
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
      return selectedDate.value &&
             date.getDate() === selectedDate.value.getDate() &&
             selectedDate.value.getMonth() === selectedDate.value.getMonth() && // Corrected: Compare month of selectedDate.value
             date.getFullYear() === selectedDate.value.getFullYear();
    };

    const isPast = (date) => {
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return date < todayStart;
    };

    const emitNavigation = (direction) => {
      if (direction === 'next' && selectedDate.value) {
        emit('date-selected', selectedDate.value.toISOString().split('T')[0]);
      } else if (direction === 'back') {
        emit('navigate-back');
      }
    };

    return {
      currentMonthName,
      currentYear,
      weekdays,
      daysInMonth,
      selectedDate,
      prevMonth,
      nextMonth,
      selectDate,
      isToday,
      isSelected,
      isPast,
      emitNavigation,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/_common.scss'; // NEW: Import common styles

.choose-date {
  @include step-card-base; // Use mixin
}

.step-header {
  @include step-header-base; // Use mixin
}

.step-header-icon {
  @include step-header-icon-base; // Use mixin
}

/* FONT AWESOME i tag styling */
.step-header-icon i {
  color: $color-text-dark;
}

h2 {
  color: $color-text-dark;
  margin-bottom: $spacing-md;
  font-size: $font-size-xxl;
  line-height: 1.2;
}

p {
  color: $color-text-medium-grey;
  margin-bottom: $spacing-xl;
  font-size: $font-size-md;
  line-height: 1.2;
}

.calendar-container {
  max-width: 400px; // Specific width for calendar
  margin: 0 auto $spacing-xxl auto; // Center calendar, space below
  background-color: $color-bg-white;
  border: 1px solid $color-border-light;
  border-radius: $spacing-sm; // 8px
  padding: $spacing-lg; // 15px
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg; // 15px
  font-size: $font-size-lg; // 1.1em
  font-weight: bold;
  color: $color-text-dark;
}

.calendar-header .nav-button {
  background: none;
  border: none;
  font-size: $font-size-xl; // 1.2em
  cursor: pointer;
  color: $color-primary-blue;
  padding: $spacing-xs $spacing-md; // 5px 10px
  border-radius: $spacing-xs; // 4px
  transition: background-color 0.2s;

  &:hover {
    background-color: #e6f2ff; // Specific light blue hover
  }
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: bold;
  color: $color-text-medium-grey;
  margin-bottom: $spacing-md; // 10px
}

.weekday {
  text-align: center;
  padding: $spacing-xs 0; // 5px 0
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: $spacing-xs; // 5px
}

.day {
  text-align: center;
  padding: $spacing-md 0; // 10px 0
  border-radius: $spacing-xs; // 4px
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  color: $color-text-dark;
  font-weight: 500;
  min-height: $spacing-xl; // 20px
  display: flex;
  justify-content: center;
  align-items: center;
}

.day.empty {
  background-color: transparent;
  cursor: default;
}

.day.available:hover {
  border-color: $color-primary-blue;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  transform: translateY(-3px);
}

.day.selected {
  border-color: $color-primary-blue;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
  background-color: $color-primary-blue;
  color: $color-bg-white;
  font-weight: bold;
}

.day.past {
  color: $color-text-disabled; // #bbb
  cursor: not-allowed;
  background-color: #f0f0f0; // Specific light grey
}

.navigation-buttons {
  margin-top: $spacing-xxl; // 30px
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.back-button {
  @include secondary-button; // Use mixin
}

.next-button {
  @include primary-button; // Use mixin
}
</style>