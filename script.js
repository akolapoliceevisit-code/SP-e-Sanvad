
        // ==========================================================
        // SETUP: Apps Script Web App URL
        // ==========================================================
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGOi5o_B7E5zwe592CIst3zAuEHF3I65NXkMA1De_da-U5fNERuxXO4kQq5SKdCaJS/exec';

        let currentDate = '';
        let allBookingsCache = [];
        let selectedFiles = [];   // Array of { file: File, valid: boolean, error: string }

        // ── File upload config (mirrors Code.gs limits) ──────────────────────
        const UPLOAD_CONFIG = {
            allowedTypes: {
                'image/jpeg':  256 * 1024,
                'image/png':   256 * 1024,
                'application/pdf': 6 * 1024 * 1024,
                'application/msword': 6 * 1024 * 1024,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 6 * 1024 * 1024
            },
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
            maxTotalSize: 10 * 1024 * 1024
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            const dateInput = document.getElementById('date-picker');
            
            // Get local YYYY-MM-DD
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;
            
            // If today is a weekend, default to next Monday
            let defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (defaultDate.getDay() === 6) { // Saturday
                defaultDate.setDate(defaultDate.getDate() + 2);
            } else if (defaultDate.getDay() === 0) { // Sunday
                defaultDate.setDate(defaultDate.getDate() + 1);
            }
            
            const defYear = defaultDate.getFullYear();
            const defMonth = String(defaultDate.getMonth() + 1).padStart(2, '0');
            const defDay = String(defaultDate.getDate()).padStart(2, '0');
            const defaultDateStr = `${defYear}-${defMonth}-${defDay}`;

            dateInput.min = today;
            dateInput.value = defaultDateStr;
            currentDate = defaultDateStr;

            // Set admin date picker to today as well
            document.getElementById('admin-date-picker').value = today;

            fetchSlots(currentDate);

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

            // Check for weekends
            const [y, m, d] = date.split('-');
            const selectedDateObj = new Date(y, m - 1, d);
            const dayOfWeek = selectedDateObj.getDay();
            
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                loading.style.display = 'none';
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--error-text); padding: 1.5rem; background: var(--error-bg); border-radius: var(--radius);">Booking is closed on weekends (Saturday & Sunday).</div>';
                modalGrid.innerHTML = '<div style="text-align: center; color: var(--error-text); padding: 1.5rem;">Booking is closed on weekends.</div>';
                showAlert('booking', 'error', 'Slot booking is not available on Saturdays and Sundays.');
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

        // =====================================================================
        //  FILE UPLOAD HANDLING
        // =====================================================================

        function initFileUpload() {
            const dropzone  = document.getElementById('upload-dropzone');
            const fileInput = document.getElementById('file-input');

            // Click to select
            fileInput.addEventListener('change', (e) => {
                addFiles(e.target.files);
                fileInput.value = ''; // reset so same file can be re-added
            });

            // Drag events
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            });
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('drag-over');
            });
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
                addFiles(e.dataTransfer.files);
            });
        }

        function addFiles(fileList) {
            const errorEl = document.getElementById('upload-error');
            errorEl.className = 'upload-error';
            errorEl.textContent = '';

            for (const file of fileList) {
                const ext = '.' + file.name.split('.').pop().toLowerCase();
                const mime = file.type.toLowerCase();
                let valid = true;
                let error = '';

                // Check extension
                if (!UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
                    valid = false;
                    error = 'File type not allowed';
                }
                // Check MIME type
                else if (!UPLOAD_CONFIG.allowedTypes.hasOwnProperty(mime)) {
                    valid = false;
                    error = 'File type not allowed';
                }
                // Check per-file size
                else {
                    const maxSize = UPLOAD_CONFIG.allowedTypes[mime];
                    if (file.size > maxSize) {
                        valid = false;
                        const limitStr = maxSize >= 1024 * 1024
                            ? (maxSize / (1024 * 1024)) + ' MB'
                            : Math.round(maxSize / 1024) + ' KB';
                        error = `Exceeds ${limitStr} limit`;
                    }
                }

                selectedFiles.push({ file, valid, error });
            }

            // Check total size
            const totalSize = selectedFiles.reduce((sum, f) => sum + (f.valid ? f.file.size : 0), 0);
            if (totalSize > UPLOAD_CONFIG.maxTotalSize) {
                errorEl.textContent = 'Total file size exceeds 10 MB. Please remove some files.';
                errorEl.className = 'upload-error visible';
            }

            renderFileList();
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            const errorEl = document.getElementById('upload-error');
            const totalSize = selectedFiles.reduce((sum, f) => sum + (f.valid ? f.file.size : 0), 0);
            if (totalSize <= UPLOAD_CONFIG.maxTotalSize) {
                errorEl.className = 'upload-error';
                errorEl.textContent = '';
            }
            renderFileList();
        }

        function renderFileList() {
            const listEl = document.getElementById('file-list');
            listEl.innerHTML = '';

            selectedFiles.forEach((entry, i) => {
                const f = entry.file;
                const ext = f.name.split('.').pop().toLowerCase();
                const isImg = ['jpg', 'jpeg', 'png'].includes(ext);
                const isPdf = ext === 'pdf';

                const iconClass = isImg ? 'img' : isPdf ? 'pdf' : 'doc';
                const iconLabel = isImg ? ext.toUpperCase() : isPdf ? 'PDF' : 'DOC';
                const sizeStr = f.size >= 1024 * 1024
                    ? (f.size / (1024 * 1024)).toFixed(1) + ' MB'
                    : Math.round(f.size / 1024) + ' KB';

                const errorClass = entry.valid ? '' : ' error';
                const errorNote = entry.valid ? '' : ` — ${entry.error}`;

                const item = document.createElement('div');
                item.className = 'file-item' + errorClass;
                item.innerHTML = `
                    <div class="file-icon ${iconClass}">${iconLabel}</div>
                    <div class="file-info">
                        <span class="file-name">${f.name}</span>
                        <span class="file-size">${sizeStr}${errorNote}</span>
                    </div>
                    <button type="button" class="file-remove" onclick="removeFile(${i})">✕</button>
                `;
                listEl.appendChild(item);
            });
        }

        // Convert a File to Base64 data URI string
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // Get all valid files as Base64 payload array
        async function getFilesPayload() {
            const validFiles = selectedFiles.filter(f => f.valid);
            const totalSize = validFiles.reduce((sum, f) => sum + f.file.size, 0);
            if (totalSize > UPLOAD_CONFIG.maxTotalSize) {
                throw new Error('Total file size exceeds 10 MB limit.');
            }

            const payload = [];
            for (const entry of validFiles) {
                const base64 = await fileToBase64(entry.file);
                payload.push({
                    name: entry.file.name,
                    mimeType: entry.file.type,
                    data: base64
                });
            }
            return payload;
        }

        // Form Submission
        document.getElementById('booking-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Check if any invalid files exist
            const hasInvalidFiles = selectedFiles.some(f => !f.valid);
            if (hasInvalidFiles) {
                showAlert('booking', 'error', 'Please remove invalid files before submitting.');
                return;
            }

            const btn = document.getElementById('btn-submit');
            const originalText = btn.textContent;

            btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2);"></div> Booking...';
            btn.disabled = true;

            try {
                // Prepare files payload (Base64)
                let filesPayload = [];
                if (selectedFiles.length > 0) {
                    btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2);"></div> Uploading files...';
                    filesPayload = await getFilesPayload();
                }

                const payload = {
                    name: document.getElementById('form-name').value,
                    phone: document.getElementById('form-phone').value,
                    email: document.getElementById('form-email').value,
                    station: document.getElementById('form-station').value,
                    address: document.getElementById('form-address').value,
                    purpose: document.getElementById('form-purpose').value,
                    slot: document.getElementById('selected-slot').value,
                    date: currentDate,
                    files: filesPayload
                };

                btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2);"></div> Submitting...';

                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('booking', 'success', `Meeting booked successfully. Check your email for the Google Meet link.`);
                    document.getElementById('booking-form').reset();
                    selectedFiles = [];
                    renderFileList();
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('date-picker').value = today;
                    currentDate = today;
                    fetchSlots(currentDate);
                } else {
                    showAlert('booking', 'error', result.message || 'Booking failed. Please try again.');
                    fetchSlots(currentDate);
                }
            } catch (err) {
                showAlert('booking', 'error', err.message || 'Network error. Please check your connection and try again.');
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
        async function loginAdmin() {
            const pass = document.getElementById('admin-pass').value;
            
            // Hash the input password using SHA-256
            const msgBuffer = new TextEncoder().encode(pass);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            
            if (hashHex !== 'cf1077a19f17bed902fd144773e2d2037759e9906c68350f935d534bf72cc50e') {
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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;"><div class="loader"></div></td></tr>';

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
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error-text);">Failed to load data.</td></tr>';
            }
        }

        // =====================================================================
        //  ADMIN — Show ALL bookings (no date filter)
        // =====================================================================
        async function loadAllBookings() {
            document.getElementById('admin-date-picker').value = '';
            const tbody = document.getElementById('admin-tbody');
            const title = document.getElementById('admin-title');
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;"><div class="loader"></div></td></tr>';

            try {
                const response = await fetch(`${SCRIPT_URL}?action=bookings`);
                const data = await response.json();
                allBookingsCache = data;
                title.textContent = `All Bookings (${data.length})`;
                renderAdminTable(data);
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error-text);">Failed to load data.</td></tr>';
            }
        }

        // =====================================================================
        //  ADMIN — Render the table rows
        // =====================================================================
        function renderAdminTable(rows) {
            const tbody = document.getElementById('admin-tbody');
            tbody.innerHTML = '';

            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--ink-muted);">No bookings found for this date.</td></tr>';
                return;
            }

            rows.sort((a, b) => {
                const slotA = getVal(a, ['Assigned Slot', 'Slot'], '');
                const slotB = getVal(b, ['Assigned Slot', 'Slot'], '');
                return String(slotA).localeCompare(String(slotB));
            });

            rows.forEach((row, i) => {
                const name    = getVal(row, ['name', 'Name', 'Name / \u0928\u093e\u0935', 'Full Name', '\u0928\u093e\u0935'], '\u2014');
                const phone   = getVal(row, ['phone', 'Phone', 'Phone number / \u092b\u094b\u0928 \u0928\u0902\u092c\u0930', 'Phone Number', '\u092b\u094b\u0928 \u0928\u0902\u092c\u0930'], '');
                const email   = getVal(row, ['email', 'Email', 'Email / \u0908-\u092e\u0947\u0932', 'Email Address', '\u0908-\u092e\u0947\u0932'], '\u2014');
                const station = getVal(row, ['station', 'Police station / \u092a\u094b\u0932\u0940\u0938 \u0938\u094d\u091f\u0947\u0936\u0928', 'Police Station', '\u092a\u094b\u0932\u0940\u0938 \u0938\u094d\u091f\u0947\u0936\u0928'], '\u2014');
                const slot    = getVal(row, ['Assigned Slot', 'assigned slot', 'Slot'], '\u2014');
                const link    = getVal(row, ['Meet Link', 'meet link'], '');
                const status  = getVal(row, ['Status', 'status'], 'Unknown');
                const docs    = getVal(row, ['Documents', 'documents', 'Docs'], '');
                const purpose = getVal(row, ['Complaint details / \u0924\u0915\u094d\u0930\u093e\u0930 ( short / \u0925\u094b\u0921\u0915\u094d\u092f\u093e\u0924 )', 'purpose', 'Purpose', 'Complaint Details', 'Complaint details', '\u0924\u0915\u094d\u0930\u093e\u0930'], '\u2014');

                const timeOnly    = extractTime(String(slot));
                const statusClass = String(status).includes('Failed') ? 'failed' : 'processed';
                const linkHtml    = link && link !== '\u2014' ? `<a href="${link}" target="_blank">Join Meet \u2192</a>` : '\u2014';

                // Build docs column
                let docsHtml = '\u2014';
                if (docs && docs !== '\u2014' && docs.trim() !== '') {
                    const docLinks = docs.split(',').map(l => l.trim()).filter(l => l);
                    if (docLinks.length === 1) {
                        docsHtml = `<button type="button" class="doc-preview-btn" onclick="openDocPreview('${docLinks[0]}', '${name}')">Preview</button>`;
                    } else if (docLinks.length > 1) {
                        docsHtml = docLinks.map((l, idx) => `<button type="button" class="doc-preview-btn" onclick="openDocPreview('${l}', '${name} - Doc ${idx + 1}')">Doc ${idx + 1}</button>`).join(' ');
                    }
                }

                const detailId = `detail-row-${i}`;

                tbody.innerHTML += `
                    <tr class="booking-row" onclick="toggleDetailRow('${detailId}', this)">
                        <td style="white-space:nowrap; font-weight:600;">
                            <span class="detail-chevron" id="chevron-${detailId}">&#9654;</span> ${timeOnly}
                        </td>
                        <td>
                            <strong style="color:var(--ink);">${name}</strong><br>
                            <span style="color:var(--ink-muted);font-size:0.75rem;">${phone}</span><br>
                            <span style="color:var(--ink-muted);font-size:0.75rem;word-break:break-all;">${email}</span>
                        </td>
                        <td style="white-space:nowrap;"><small>${station}</small></td>
                        <td style="min-width: 140px;">${docsHtml}</td>
                        <td style="white-space:nowrap;">${linkHtml}</td>
                        <td><span class="status-badge ${statusClass}">${status}</span></td>
                        <td><button type="button" class="doc-preview-btn" style="color:var(--error-text);border-color:rgba(176,0,32,0.3);" onclick="event.stopPropagation(); confirmDeleteBooking('${String(slot).replace(/'/g, "\\'")}', '${String(phone).replace(/'/g, "\\'")}')">Delete</button></td>
                    </tr>
                    <tr class="detail-row" id="${detailId}" style="display:none;">
                        <td colspan="7">
                            <div class="detail-row-content">
                                <span class="detail-label">Complaint Details / \u0924\u0915\u094d\u0930\u093e\u0930</span>
                                <p class="detail-text">${purpose}</p>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        // =====================================================================
        //  ADMIN — Toggle complaint detail row
        // =====================================================================
        function toggleDetailRow(detailId, triggerRow) {
            const detailRow = document.getElementById(detailId);
            const chevron = document.getElementById('chevron-' + detailId);
            if (!detailRow) return;

            const isOpen = detailRow.style.display !== 'none';
            detailRow.style.display = isOpen ? 'none' : 'table-row';
            if (chevron) chevron.classList.toggle('open', !isOpen);
            if (triggerRow) triggerRow.classList.toggle('expanded', !isOpen);
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

        // =====================================================================
        //  DELETE CONFIRMATION MODAL
        // =====================================================================
        function confirmDeleteBooking(slot, phone) {
            const overlay = document.getElementById('delete-confirm-overlay');
            const msg = document.getElementById('delete-confirm-message');
            const btn = document.getElementById('delete-confirm-btn');
            
            const timeOnly = extractTime(slot);
            msg.innerHTML = `Are you sure you want to delete the booking for <strong>${timeOnly}</strong>?<br>This action cannot be undone.`;
            
            btn.onclick = function() {
                deleteBooking(slot, phone);
            };
            
            overlay.classList.add('open');
        }

        function closeDeleteConfirm(e) {
            if (e && e.target !== e.currentTarget) return;
            document.getElementById('delete-confirm-overlay').classList.remove('open');
        }

        // Delete Booking function
        async function deleteBooking(slot, phone) {
            const btn = document.getElementById('delete-confirm-btn');
            const originalText = btn.textContent;
            btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2);"></div>';
            btn.disabled = true;

            const payload = { action: 'delete', slot: slot, phone: phone };

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                
                if (result.success) {
                    closeDeleteConfirm();
                    showAlert('admin', 'success', result.message);
                    // Refresh data
                    const filterDate = document.getElementById('admin-date-picker').value;
                    if (filterDate) {
                        loadAdminData();
                    } else {
                        loadAllBookings();
                    }
                } else {
                    showAlert('admin', 'error', result.message || 'Failed to delete booking.');
                }
            } catch (err) {
                showAlert('admin', 'error', 'Network error. Please try again.');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }

        // Initialize file upload when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            initFileUpload();
        });

        // =====================================================================
        //  DOCUMENT PREVIEW MODAL
        // =====================================================================

        function extractDriveFileId(url) {
            // Handle: https://drive.google.com/file/d/FILE_ID/view...
            const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match1) return match1[1];
            // Handle: https://drive.google.com/open?id=FILE_ID
            const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match2) return match2[1];
            return null;
        }

        function openDocPreview(url, title) {
            const overlay = document.getElementById('doc-preview-overlay');
            const iframe  = document.getElementById('doc-preview-iframe');
            const loading = document.getElementById('doc-preview-loading');
            const titleEl = document.getElementById('doc-preview-title');
            const newTab  = document.getElementById('doc-preview-newTab');

            titleEl.textContent = title || 'Document Preview';
            newTab.href = url;

            // Build embeddable preview URL
            const fileId = extractDriveFileId(url);
            let previewUrl = url;
            if (fileId) {
                previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            }

            // Show loading, hide iframe
            loading.className = 'doc-preview-loading';
            iframe.style.display = 'none';
            iframe.src = '';

            // Open modal
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Load iframe
            iframe.src = previewUrl;
            iframe.onload = () => {
                loading.className = 'doc-preview-loading hidden';
                iframe.style.display = 'block';
            };
        }

        function closeDocPreview(e) {
            if (e && e.target !== e.currentTarget) return;
            const overlay = document.getElementById('doc-preview-overlay');
            const iframe  = document.getElementById('doc-preview-iframe');
            overlay.classList.remove('open');
            iframe.src = '';
            document.body.style.overflow = '';
        }
