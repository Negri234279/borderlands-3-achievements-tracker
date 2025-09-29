let hideCheckedButtonValue = false

document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.achievement-checkbox')
    const savedAchievements =
        JSON.parse(localStorage.getItem('bo3-archives-achievements')) || {}

    const totalCompletedEl = document.getElementById(
        'total-achievements-completed',
    )
    const totalEl = document.getElementById('total-achievements')

    // Re-stripe visible rows (only tbody rows). Adds .even/.odd classes.
    function stripeTables() {
        document.querySelectorAll('table.borderlands').forEach((table) => {
            const allTbodyRows = Array.from(table.querySelectorAll('tbody tr'))

            // visible rows in document order
            const visibleRows = allTbodyRows.filter(
                (row) => getComputedStyle(row).display !== 'none',
            )

            // assign classes to visible rows
            visibleRows.forEach((row, idx) => {
                row.classList.remove('odd', 'even')
                row.classList.add(idx % 2 === 0 ? 'even' : 'odd')
            })

            // remove classes from hidden rows (optional, keeps DOM clean)
            allTbodyRows
                .filter((row) => getComputedStyle(row).display === 'none')
                .forEach((row) => row.classList.remove('odd', 'even'))
        })
    }

    // Update per-table captions and global counters
    function updateCaptions() {
        let globalCompleted = 0
        let globalTotal = 0

        const tables = document.querySelectorAll('table')
        tables.forEach((table) => {
            const caption = table.querySelector('caption')
            if (!caption) return

            const completedSpan = caption.querySelector('.completed-count')
            const totalSpan = caption.querySelector('.total-count')

            // count only checkboxes inside tbody (so thead checkboxes aren't included)
            const allCheckboxes = table.querySelectorAll(
                'tbody .achievement-checkbox',
            )
            const completed = Array.from(allCheckboxes).filter(
                (cb) => cb.checked,
            ).length

            if (completedSpan) completedSpan.textContent = completed
            if (totalSpan) totalSpan.textContent = allCheckboxes.length

            globalCompleted += completed
            globalTotal += allCheckboxes.length
        })

        if (totalCompletedEl) totalCompletedEl.textContent = globalCompleted
        if (totalEl) totalEl.textContent = globalTotal

        // after counters updated, refresh striping so visible rows get proper classes
        stripeTables()
    }

    // Initialize checkboxes from storage and attach listeners
    checkboxes.forEach((checkbox) => {
        const achievementId = checkbox.getAttribute('data-achievement-id')
        if (savedAchievements[achievementId]) {
            checkbox.checked = true
        }

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                savedAchievements[achievementId] = true
            } else {
                delete savedAchievements[achievementId]
            }

            if (hideCheckedButtonValue && this.checked) {
                this.closest('tr').style.display = 'none'
            }

            localStorage.setItem(
                'bo3-archives-achievements',
                JSON.stringify(savedAchievements),
            )

            // update counters & striping when a checkbox changes
            updateCaptions()
        })
    })

    // Buttons
    const hideCheckedButton = document.getElementById('hide-checked')
    const showAllButton = document.getElementById('show-all')
    const resetButton = document.getElementById('reset')

    hideCheckedButton.addEventListener('click', () => {
        hideCheckedButtonValue = true

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                checkbox.closest('tr').style.display = 'none'
            }
        })

        // re-stripe after hiding
        stripeTables()
    })

    showAllButton.addEventListener('click', () => {
        hideCheckedButtonValue = false

        checkboxes.forEach((checkbox) => {
            checkbox.closest('tr').style.display = ''
        })

        // re-stripe after showing
        stripeTables()
    })

    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all achievements?')) {
            localStorage.removeItem('bo3-archives-achievements')

            checkboxes.forEach((checkbox) => {
                checkbox.checked = false
                checkbox.closest('tr').style.display = ''
            })

            hideCheckedButtonValue = false
            
            updateCaptions()
        }
    })

    // initial update
    updateCaptions()
})
