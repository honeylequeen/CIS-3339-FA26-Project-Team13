<!--
  DataTable: one reusable table for the client, event, and service lists.

  Props
    columns: [{ label, field, render?, headerClass?, cellClass? }]
      - field can be a dot path, e.g. 'address.city'
      - render(row) returns the text to show (sorting still uses the raw field value)
    rows:      the array of records to show
    rowKey:    the property that uniquely identifies a row (default '_id')
    pageSize:  rows per page (default 10)
    emptyText: what the "No results" row says

  Emits
    row-click(row) when a row is clicked

  Sorting and pagination happen client-side on whatever rows were passed in.
-->
<template>
  <div>
    <table class="min-w-full shadow-md rounded">
      <thead class="bg-gray-50 text-xl">
        <tr>
          <th
            v-for="column in columns"
            :key="column.field"
            class="p-4 text-left"
            :class="column.headerClass"
            :aria-sort="ariaSort(column.field)"
          >
            <button
              type="button"
              class="sort-button flex items-center gap-1 font-bold"
              @click="toggleSort(column.field)"
            >
              {{ column.label }}
              <span class="text-sm text-gray-400" aria-hidden="true">{{ sortIcon(column.field) }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-300">
        <tr
          v-for="row in pagedRows"
          :key="row[rowKey]"
          class="cursor-pointer data-row"
          tabindex="0"
          @click="emit('row-click', row)"
          @keyup.enter="emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.field"
            class="p-2 text-left"
            :class="column.cellClass"
          >
            {{ cellText(row, column) }}
          </td>
        </tr>
        <!-- Shown when there is nothing to display -->
        <tr v-if="!sortedRows.length">
          <td :colspan="columns.length" class="p-6 text-center text-gray-500 italic">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div
      v-if="sortedRows.length"
      class="flex flex-wrap items-center justify-between gap-4 mt-4 text-gray-700"
    >
      <span>Showing {{ firstShown }}–{{ lastShown }} of {{ sortedRows.length }}</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="border border-red-700 bg-white text-red-700 rounded disabled:opacity-40"
          :disabled="page === 1"
          @click="page--"
        >
          Previous
        </button>
        <span>Page {{ page }} of {{ pageCount }}</span>
        <button
          type="button"
          class="border border-red-700 bg-white text-red-700 rounded disabled:opacity-40"
          :disabled="page === pageCount"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: '_id' },
  pageSize: { type: Number, default: 10 },
  emptyText: { type: String, default: 'No results' }
})

const emit = defineEmits(['row-click'])

// ----- Reading values -----

// Supports dot paths like 'phoneNumber.primary'
function getValue(row, field) {
  return field.split('.').reduce((value, key) => (value == null ? value : value[key]), row)
}

function cellText(row, column) {
  if (typeof column.render === 'function') return column.render(row)
  const value = getValue(row, column.field)
  return value ?? ''
}

// ----- Sorting: ascending -> descending -> unsorted -----

const sortField = ref(null)
const sortDirection = ref(null) // 'asc' | 'desc' | null

function toggleSort(field) {
  if (sortField.value !== field) {
    sortField.value = field
    sortDirection.value = 'asc'
  } else if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc'
  } else {
    sortField.value = null
    sortDirection.value = null
  }
  page.value = 1
}

function sortIcon(field) {
  if (sortField.value !== field) return '↕'
  return sortDirection.value === 'asc' ? '▲' : '▼'
}

function ariaSort(field) {
  if (sortField.value !== field) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

const isEmpty = (value) => value == null || value === ''

// direction is 1 for ascending, -1 for descending.
// Empty values always go to the bottom, whichever way you sort.
function compare(a, b, direction) {
  if (isEmpty(a) && isEmpty(b)) return 0
  if (isEmpty(a)) return 1
  if (isEmpty(b)) return -1
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * direction
  return (
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * direction
  )
}

const sortedRows = computed(() => {
  // Copy first so sorting never changes the parent's array
  const rows = Array.isArray(props.rows) ? [...props.rows] : []
  if (!sortField.value) return rows
  const direction = sortDirection.value === 'desc' ? -1 : 1
  return rows.sort((rowA, rowB) =>
    compare(getValue(rowA, sortField.value), getValue(rowB, sortField.value), direction)
  )
})

// ----- Pagination -----

const page = ref(1)

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / props.pageSize)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

const firstShown = computed(() => (sortedRows.value.length ? (page.value - 1) * props.pageSize + 1 : 0))
const lastShown = computed(() => Math.min(page.value * props.pageSize, sortedRows.value.length))

// New rows (a search, a refresh, clearing a search) always start back on page 1,
// so you never see a page left over from the previous results.
watch(
  () => props.rows,
  () => {
    page.value = 1
  }
)

// Safety net: never sit on a page that no longer exists
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})
</script>

<style scoped>
.sort-button {
  padding: 0;
}

.data-row:hover,
.data-row:focus {
  background-color: rgba(255, 0, 0, 0.1);
  transition: background-color 0.3s ease-in-out;
  outline: none;
}
</style>
