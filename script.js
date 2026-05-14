
        // ==========================================================
        // SETUP: Apps Script Web App URL
        // ==========================================================
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2z6nYHfE-vRpVr41eczDQ0PkBDme_GKNhettL1DhS0mE6n4wn2GC_txQ9sz9aMf9I/exec';

        let currentDate = '';
        let allBookingsCache = [];

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            const dateInput = document.getElementById('date-picker');
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
            currentDate = today;

            // Set admin date picker to today as well
            document.getElementById('admin-date-picker').value = today;

            fetchSlots(today);

            dateInput.addEventListener('change', (e) => {
                currentDate = e.target.value;
                fetchSlots(currentDate);
            });
        });

        // Tab Switching
        function switchTab(tab) {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.nav-buttons button').forEach(b => b.classList.remove('active'));

            document.getElementById(tab + '-view').classList.add('active');
            event.target.classList.add('active');
        }

        // Fetch & Render Slots
        async function fetchSlots(date) {
            const grid = document.getElementById('slots-grid');
            const modalGrid = document.getElementById('modal-slots-grid');
            const loading = document.getElementById('slots-loading');
            const hiddenInput = document.getElementById('selected-slot');
            const btnSubmit = document.getElementById('btn-submit');
            const mobileTrigger = document.getElementById('mobile-slot-trigger');
            const mobileLabel = document.getElementById('mobile-slot-label');

            grid.innerHTML = '';
            modalGrid.innerHTML = '';
            hiddenInput.value = '';
            btnSubmit.disabled = true;
            loading.style.display = 'flex';

            // Reset mobile trigger
            mobileTrigger.classList.remove('has-selection');
            mobileLabel.textContent = 'Tap to select a time slot';

            if(SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE'){
                 loading.style.display = 'none';
                 showAlert('booking', 'error', 'Error: Please configure the SCRIPT_URL in the HTML file first.');
                 return;
            }

            try {
                const response = await fetch(`${SCRIPT_URL}?action=slots&date=${date}`);
                const data = await response.json();

                loading.style.display = 'none';

                data.slots.forEach((slot, index) => {
                    // Create button for desktop inline grid
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'slot-btn';
                    btn.style.animationDelay = `${index * 0.03}s`;
                    btn.textContent = slot.label;
                    btn.dataset.slotValue = slot.value;

                    // Create button for mobile modal grid
                    const modalBtn = document.createElement('button');
                    modalBtn.type = 'button';
                    modalBtn.className = 'slot-btn';
                    modalBtn.textContent = slot.label;
                    modalBtn.dataset.slotValue = slot.value;

                    if (slot.booked) {
                        btn.disabled = true;
                        modalBtn.disabled = true;
                    } else {
                        btn.onclick = () => selectSlot(slot.value, slot.label);
                        modalBtn.onclick = () => {
                            selectSlot(slot.value, slot.label);
                            closeSlotModal();
                        };
                    }
                    grid.appendChild(btn);
                    modalGrid.appendChild(modalBtn);
                });

            } catch (err) {
                loading.style.display = 'none';
                showAlert('booking', 'error', 'Failed to load slots. Please try again.');
            }
        }

        function selectSlot(slotValue, slotLabel) {
            // Sync selection across both grids
            document.querySelectorAll('.slot-btn').forEach(b => {
                if (b.dataset.slotValue === slotValue) {
                    b.classList.add('selected');
                } else {
                    b.classList.remove('selected');
                }
            });

            document.getElementById('selected-slot').value = slotValue;
            document.getElementById('btn-submit').disabled = false;

            // Update mobile trigger button text
            const mobileTrigger = document.getElementById('mobile-slot-trigger');
            const mobileLabel = document.getElementById('mobile-slot-label');
            mobileTrigger.classList.add('has-selection');
            mobileLabel.textContent = '✓ ' + slotLabel;
        }

        // ── Mobile Slot Modal ────────────────────────────────────────────────
        function openSlotModal() {
            document.getElementById('slot-modal-overlay').classList.add('open');
            document.body.style.overflow = 'hidden'; // prevent background scroll
        }

        function closeSlotModal(e) {
            // If called from overlay click, only close if clicking the overlay itself
            if (e && e.target !== e.currentTarget) return;
            document.getElementById('slot-modal-overlay').classList.remove('open');
            document.body.style.overflow = '';
        }

        // Form Submission
        document.getElementById('booking-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('btn-submit');
            const originalText = btn.textContent;

            btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2);"></div> Booking...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('form-name').value,
                phone: document.getElementById('form-phone').value,
                email: document.getElementById('form-email').value,
                station: document.getElementById('form-station').value,
                address: document.getElementById('form-address').value,
                purpose: document.getElementById('form-purpose').value,
                slot: document.getElementById('selected-slot').value,
                date: currentDate
            };

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('booking', 'success', `Meeting booked successfully. Check your email for the Google Meet link.`);
                    document.getElementById('booking-form').reset();
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('date-picker').value = today;
                    currentDate = today;
                    fetchSlots(currentDate);
                } else {
                    showAlert('booking', 'error', result.message || 'Booking failed. Please try again.');
                    fetchSlots(currentDate);
                }
            } catch (err) {
                showAlert('booking', 'error', 'Network error. Please check your connection and try again.');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        // =====================================================================
        //  ADMIN — Flexible key finder (handles different header formats)
        // =====================================================================

        function getVal(row, candidates, fallback) {
            for (const key of candidates) {
                if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
            }
            const rowKeys = Object.keys(row);
            for (const candidate of candidates) {
                const lower = candidate.toLowerCase();
                for (const k of rowKeys) {
                    if (k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())) {
                        if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
                    }
                }
            }
            return fallback || '—';
        }

        function extractTime(slotStr) {
            if (!slotStr || slotStr === '—') return '—';
            try {
                const parts = slotStr.split('–');
                if (parts.length < 2) return slotStr;

                const leftPart = parts[0].trim();
                const endTime  = parts[1].trim();
                const spaceIdx = leftPart.lastIndexOf(' ');
                const startTime = leftPart.substring(spaceIdx + 1);

                return formatTime24to12(startTime) + ' – ' + formatTime24to12(endTime);
            } catch (e) {
                return slotStr;
            }
        }

        function formatTime24to12(t) {
            const [h, m] = t.split(':').map(Number);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
        }

        function extractDate(slotStr) {
            if (!slotStr) return '';
            const match = slotStr.match(/(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : '';
        }

        // =====================================================================
        //  ADMIN — Login
        // =====================================================================
        function loginAdmin() {
            const pass = document.getElementById('admin-pass').value;
            if (pass !== 'admin123') {
                showAlert('admin', 'error', 'Incorrect password.');
                return;
            }
            document.getElementById('admin-alert').style.display = 'none';
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            loadAdminData();
        }

        // =====================================================================
        //  ADMIN — Load bookings for a specific date
        // =====================================================================
        async function loadAdminData() {
            const filterDate = document.getElementById('admin-date-picker').value;
            const tbody = document.getElementById('admin-tbody');
            const title = document.getElementById('admin-title');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;"><div class="loader"></div></td></tr>';

            try {
                const response = await fetch(`${SCRIPT_URL}?action=bookings`);
                const data = await response.json();
                allBookingsCache = data;

                let filtered;
                if (filterDate) {
                    filtered = data.filter(row => {
                        const slot = getVal(row, ['Assigned Slot', 'assigned slot', 'Slot'], '');
                        return extractDate(String(slot)) === filterDate;
                    });
                    const dateObj = new Date(filterDate + 'T00:00:00');
                    const readableDate = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                    title.textContent = `Bookings — ${readableDate} (${filtered.length})`;
                } else {
                    filtered = data;
                    title.textContent = `All Bookings (${filtered.length})`;
                }

                renderAdminTable(filtered);
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--error-text);">Failed to load data.</td></tr>';
            }
        }

        // =====================================================================
        //  ADMIN — Show ALL bookings (no date filter)
        // =====================================================================
        async function loadAllBookings() {
            document.getElementById('admin-date-picker').value = '';
            const tbody = document.getElementById('admin-tbody');
            const title = document.getElementById('admin-title');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;"><div class="loader"></div></td></tr>';

            try {
                const response = await fetch(`${SCRIPT_URL}?action=bookings`);
                const data = await response.json();
                allBookingsCache = data;
                title.textContent = `All Bookings (${data.length})`;
                renderAdminTable(data);
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--error-text);">Failed to load data.</td></tr>';
            }
        }

        // =====================================================================
        //  ADMIN — Render the table rows
        // =====================================================================
        function renderAdminTable(rows) {
            const tbody = document.getElementById('admin-tbody');
            tbody.innerHTML = '';

            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--ink-muted);">No bookings found for this date.</td></tr>';
                return;
            }

            rows.sort((a, b) => {
                const slotA = getVal(a, ['Assigned Slot', 'Slot'], '');
                const slotB = getVal(b, ['Assigned Slot', 'Slot'], '');
                return String(slotA).localeCompare(String(slotB));
            });

            rows.forEach((row, i) => {
                const name    = getVal(row, ['name', 'Name', 'Name / नाव', 'Full Name', 'नाव'], '—');
                const phone   = getVal(row, ['phone', 'Phone', 'Phone number / फोन नंबर', 'Phone Number', 'फोन नंबर'], '');
                const email   = getVal(row, ['email', 'Email', 'Email / ई-मेल', 'Email Address', 'ई-मेल'], '—');
                const station = getVal(row, ['station', 'Police station / पोलीस स्टेशन', 'Police Station', 'पोलीस स्टेशन'], '—');
                const slot    = getVal(row, ['Assigned Slot', 'assigned slot', 'Slot'], '—');
                const link    = getVal(row, ['Meet Link', 'meet link'], '');
                const status  = getVal(row, ['Status', 'status'], 'Unknown');

                const timeOnly    = extractTime(String(slot));
                const statusClass = String(status).includes('Failed') ? 'failed' : 'processed';
                const linkHtml    = link && link !== '—' ? `<a href="${link}" target="_blank">Join Meet →</a>` : '—';

                tbody.innerHTML += `
                    <tr>
                        <td style="white-space:nowrap; font-weight:600;">${timeOnly}</td>
                        <td><strong style="color:var(--ink);">${name}</strong><br><span style="color:var(--ink-muted);font-size:0.75rem;">${phone}</span></td>
                        <td style="white-space:nowrap;"><small>${station}</small></td>
                        <td style="word-break:break-all; max-width:200px;">${email}</td>
                        <td style="white-space:nowrap;">${linkHtml}</td>
                        <td><span class="status-badge ${statusClass}">${status}</span></td>
                    </tr>
                `;
            });
        }

        // Alert Helper
        function showAlert(view, type, message) {
            const el = document.getElementById(`${view}-alert`);
            el.className = `alert ${type}`;
            el.textContent = message;

            if(type === 'success' || type === 'error'){
                setTimeout(() => { el.style.display = 'none'; }, 8000);
            }
        }