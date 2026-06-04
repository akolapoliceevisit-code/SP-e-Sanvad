
        // ==========================================================
        // SETUP: Apps Script Web App URL
        // ==========================================================
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzatJ3VKMWjtL2Jcdz0wPWj05aMNG6LdGp5Gqu713DXcWlZ86mk5QUM0sOdhU4QxS44/exec';

        let currentDate = '';
        let allBookingsCache = [];
        let selectedFiles = [];   // Array of { file: File, valid: boolean, error: string }
        let adminToken = null;
        let currentLang = localStorage.getItem('sp_lang') || 'en';

        const I18N = {
            en: {
                nav_booking: 'Book Slot',
                nav_admin: 'Admin',
                booking_title: 'Schedule a Meeting with SP Akola',
                booking_subtitle: 'Book a 5-minute Google Meet slot available daily from 6:00 PM to 7:00 PM.',
                section_datetime: 'Date & Time',
                label_date: 'Select Date',
                label_slots: 'Available Slots',
                slot_select_prompt: 'Tap to select a time slot',
                section_details: 'Your Details',
                label_name: 'Name / नाव *',
                label_phone: 'Phone / फोन नंबर *',
                label_email: 'Email / ई-मेल *',
                label_station: 'Police Station / पोलीस स्टेशन *',
                station_placeholder: 'Select station',
                label_address: 'Address / पत्ता *',
                label_purpose: 'Complaint Details / तक्रार (थोडक्यात) <span style="color:var(--ink-muted);font-weight:400;">(Optional)</span>',
                label_documents: 'Attach Documents / कागदपत्रे जोडा <span style="color:var(--ink-muted);font-weight:400;">(Optional)</span>',
                label_optional: '(Optional)',
                upload_prompt: 'Click or drag files here',
                upload_limits: 'JPG, PNG (max 256 KB) · PDF, DOC, DOCX (max 6 MB) · Total 10 MB',
                btn_book: 'Book Meeting',
                admin_title: 'Admin Dashboard',
                admin_subtitle: 'View and manage all scheduled meetings — filtered by date.',
                admin_password_label: 'Admin Password',
                admin_password_placeholder: 'Enter password',
                btn_login: 'Login',
                admin_filter_label: 'Filter by Date',
                btn_load: 'Load',
                btn_show_all: 'Show All',
                export_label: 'Export Bookings',
                export_from: 'From',
                export_to: 'To',
                btn_export_csv: '↓ Export CSV',
                admin_bookings_title: 'Bookings',
                btn_refresh: '↻ Refresh',
                th_timeslot: 'Time Slot',
                th_citizen: 'Citizen Details',
                th_station: 'Station',
                th_docs: 'Docs',
                th_meet: 'Meet Link',
                th_status: 'Status',
                th_actions: 'Actions',
                modal_select_slot: 'Select a Time Slot',
                doc_preview_title: 'Document Preview',
                doc_open_tab: 'Open ↗',
                doc_loading: 'Loading preview...',
                delete_title: 'Delete Booking?',
                delete_message: 'Are you sure you want to delete this booking? This action cannot be undone.',
                btn_cancel: 'Cancel',
                btn_delete: 'Delete',
                footer_text: 'SP-e Samvaad · SP Office, Akola District · Maharashtra Police',
                toast_booking_success: 'Meeting booked successfully. Check your email for the Google Meet link.',
                toast_booking_error: 'Booking failed. Please try again.',
                toast_network_error: 'Network error. Please check your connection and try again.',
                toast_slots_error: 'Failed to load slots. Please try again.',
                toast_slots_weekend: 'Slot booking is not available on Saturdays and Sundays.',
                toast_slots_weekend_inline: 'Booking is closed on weekends (Saturday & Sunday).',
                toast_slots_weekend_modal: 'Booking is closed on weekends.',
                toast_invalid_files: 'Please remove invalid files before submitting.',
                toast_form_errors: 'Please fix the errors in the form before submitting.',
                toast_login_error: 'Incorrect password.',
                toast_login_network: 'Network error during login.',
                toast_load_failed: 'Failed to load data.',
                toast_no_bookings: 'No bookings found for this date.',
                toast_delete_success: 'Booking deleted successfully.',
                toast_delete_failed: 'Failed to delete booking.',
                toast_delete_network: 'Network error. Please try again.',
                toast_csv_no_data: 'No bookings found for the selected date range.',
                toast_csv_error: 'Failed to export CSV. Please try again.',
                toast_csv_unauthorized: 'Session expired. Please log in again.',
                detail_label: 'Complaint Details / तक्रार',
                join_meet: 'Join Meet →',
                preview: 'Preview',
                doc_prefix: 'Doc',
                delete_confirm_msg_prefix: 'Are you sure you want to delete the booking for <strong>',
                delete_confirm_msg_suffix: '</strong>?<br>This action cannot be undone.',
                lang_toggle_label: 'मराठी',
                weekend_closed_msg: 'Booking is closed on weekends (Saturday & Sunday).',
                weekend_closed_modal: 'Booking is closed on weekends.',
                blocked_dates_section: 'Blocked Dates',
                block_date_label: 'Select Date',
                block_reason_label: 'Reason (optional)',
                block_reason_placeholder: 'e.g. Holiday, Maintenance',
                btn_block_date: 'Block Date',
                btn_unblock: 'Unblock',
                toast_date_blocked: 'Date blocked successfully.',
                toast_date_blocked_with_count: 'Date blocked. %d existing booking(s) deleted.',
                toast_date_unblocked: 'Date unblocked successfully.',
                toast_block_failed: 'Failed to block date.',
                toast_unblock_failed: 'Failed to unblock date.',
                toast_date_already_blocked: 'This date is already blocked.',
                toast_date_not_blocked: 'This date was not blocked.',
                date_blocked_msg: 'Bookings are closed for this date.',
                date_blocked_reason_msg: 'Bookings are closed for this date (%s).',
                blocked_dates_empty: 'No dates are currently blocked.'
            },
            mr: {
                nav_booking: 'स्लॉट बुक करा',
                nav_admin: 'ॲडमिन',
                booking_title: 'पोलीस अधीक्षक, अकोला यांच्याशी भेट निश्चित करा',
                booking_subtitle: 'दररोज संध्याकाळी ६:०० ते ७:०० दरम्यान ५ मिनिटांचा Google Meet स्लॉट बुक करा.',
                section_datetime: 'तारीख आणि वेळ',
                label_date: 'तारीख निवडा',
                label_slots: 'उपलब्ध स्लॉट्स',
                slot_select_prompt: 'वेळ स्लॉट निवडण्यासाठी टॅप करा',
                section_details: 'तुमची माहिती',
                label_name: 'नाव / Name *',
                label_phone: 'फोन नंबर / Phone *',
                label_email: 'ई-मेल / Email *',
                label_station: 'पोलीस स्टेशन / Police Station *',
                station_placeholder: 'स्टेशन निवडा',
                label_address: 'पत्ता / Address *',
                label_purpose: 'तक्रार (थोडक्यात) / Complaint Details <span style="color:var(--ink-muted);font-weight:400;">(पर्यायी)</span>',
                label_documents: 'कागदपत्रे जोडा / Attach Documents <span style="color:var(--ink-muted);font-weight:400;">(पर्यायी)</span>',
                label_optional: '(पर्यायी)',
                upload_prompt: 'येथे क्लिक करा किंवा फाइल ड्रॅग करा',
                upload_limits: 'JPG, PNG (जास्तीत जास्त २५६ KB) · PDF, DOC, DOCX (जास्तीत जास्त ६ MB) · एकूण १० MB',
                btn_book: 'भेट बुक करा',
                admin_title: 'ॲडमिन डॅशबोर्ड',
                admin_subtitle: 'तारीखानुसार सर्व नियोजित बैठका पहा आणि व्यवस्थापित करा.',
                admin_password_label: 'ॲडमिन पासवर्ड',
                admin_password_placeholder: 'पासवर्ड टाका',
                btn_login: 'लॉगिन',
                admin_filter_label: 'तारखेनुसार फिल्टर',
                btn_load: 'लोड',
                btn_show_all: 'सर्व पहा',
                export_label: 'बुकिंग एक्सपोर्ट',
                export_from: 'पासून',
                export_to: 'पर्यंत',
                btn_export_csv: '↓ CSV डाउनलोड',
                admin_bookings_title: 'बुकिंग्स',
                btn_refresh: '↻ रीफ्रेश',
                th_timeslot: 'वेळ स्लॉट',
                th_citizen: 'नागरिक माहिती',
                th_station: 'स्टेशन',
                th_docs: 'कागदपत्रे',
                th_meet: 'मीट लिंक',
                th_status: 'स्थिती',
                th_actions: 'कृती',
                modal_select_slot: 'वेळ स्लॉट निवडा',
                doc_preview_title: 'कागदपत्र पूर्वावलोकन',
                doc_open_tab: 'उघडा ↗',
                doc_loading: 'लोड होत आहे...',
                delete_title: 'बुकिंग हटवायचे?',
                delete_message: 'तुम्हाला खात्री आहे की हे बुकिंग हटवायचे आहे? ही क्रिया पूर्ववत करता येणार नाही.',
                btn_cancel: 'रद्द करा',
                btn_delete: 'हटवा',
                footer_text: 'SP-e संवाद · पोलीस अधीक्षक कार्यालय, अकोला जिल्हा · महाराष्ट्र पोलीस',
                toast_booking_success: 'भेट यशस्वीरित्या बुक झाली. Google Meet लिंकसाठी तुमचा ई-मेल तपासा.',
                toast_booking_error: 'बुकिंग अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
                toast_network_error: 'नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.',
                toast_slots_error: 'स्लॉट्स लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
                toast_slots_weekend: 'शनिवार आणि रविवारी स्लॉट बुकिंग उपलब्ध नाही.',
                toast_slots_weekend_inline: 'वीकेंडवर (शनिवार आणि रविवार) बुकिंग बंद आहे.',
                toast_slots_weekend_modal: 'वीकेंडवर बुकिंग बंद आहे.',
                toast_invalid_files: 'कृपया सबमिट करण्यापूर्वी अवैध फाइल्स काढून टाका.',
                toast_form_errors: 'कृपया सबमिट करण्यापूर्वी फॉर्ममधील त्रुटी दुरुस्त करा.',
                toast_login_error: 'चुकीचा पासवर्ड.',
                toast_login_network: 'लॉगिन दरम्यान नेटवर्क त्रुटी.',
                toast_load_failed: 'डेटा लोड करण्यात अयशस्वी.',
                toast_no_bookings: 'या तारखेसाठी कोणतेही बुकिंग आढळले नाही.',
                toast_delete_success: 'बुकिंग यशस्वीरित्या हटवले.',
                toast_delete_failed: 'बुकिंग हटवण्यात अयशस्वी.',
                toast_delete_network: 'नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.',
                toast_csv_no_data: 'निवडलेल्या तारीख श्रेणीसाठी कोणतेही बुकिंग आढळले नाही.',
                toast_csv_error: 'CSV एक्सपोर्ट अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
                toast_csv_unauthorized: 'सत्र समाप्त झाले. कृपया पुन्हा लॉगिन करा.',
                detail_label: 'तक्रार / Complaint Details',
                join_meet: 'मीट मध्ये सामील व्हा →',
                preview: 'पूर्वावलोकन',
                doc_prefix: 'कागद',
                delete_confirm_msg_prefix: 'तुम्हाला <strong>',
                delete_confirm_msg_suffix: '</strong> या वेळेचे बुकिंग हटवायचे आहे?<br>ही क्रिया पूर्ववत करता येणार नाही.',
                lang_toggle_label: 'English',
                weekend_closed_msg: 'वीकेंडवर (शनिवार आणि रविवार) बुकिंग बंद आहे.',
                weekend_closed_modal: 'वीकेंडवर बुकिंग बंद आहे.',
                blocked_dates_section: 'अवरोधित तारीखे',
                block_date_label: 'तारीख निवडा',
                block_reason_label: 'कारण (पर्यायी)',
                block_reason_placeholder: 'उदा. सुटी, देखभाल',
                btn_block_date: 'तारीख अवरोधित करा',
                btn_unblock: 'अनब्लॉक करा',
                toast_date_blocked: 'तारीख यशस्वीरित्या अवरोधित झाली.',
                toast_date_blocked_with_count: 'तारीख अवरोधित झाली. %d विद्यमान बुकिंग(s) हटवले.',
                toast_date_unblocked: 'तारीख यशस्वीरित्या अनब्लॉक झाली.',
                toast_block_failed: 'तारीख अवरोधित करण्यात अयशस्वी.',
                toast_unblock_failed: 'तारीख अनब्लॉक करण्यात अयशस्वी.',
                toast_date_already_blocked: 'ही तारीख आधीपासून अवरोधित आहे.',
                toast_date_not_blocked: 'ही तारीख अवरोधित नव्हती.',
                date_blocked_msg: 'या तारखेसाठी बुकिंग बंद आहे.',
                date_blocked_reason_msg: 'या तारखेसाठी बुकिंग बंद आहे (%s).',
                blocked_dates_empty: 'सध्या कोणतीही तारीख अवरोधित नाही.'
            }
        };

        function t(key) {
            return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.en[key]) || key;
        }

        function applyLanguage() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                el.innerHTML = t(key);
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                el.placeholder = t(key);
            });
            const langBtn = document.getElementById('lang-toggle');
            if (langBtn) langBtn.textContent = t('lang_toggle_label');
            document.documentElement.lang = currentLang === 'mr' ? 'mr' : 'en';
        }

        function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'mr' : 'en';
            localStorage.setItem('sp_lang', currentLang);
            applyLanguage();
        }

        function escapeHTML(str) {
            if (str == null) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

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
            applyLanguage();

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
            const hiddenInput = document.getElementById('selected-slot');
            const btnSubmit = document.getElementById('btn-submit');
            const mobileTrigger = document.getElementById('mobile-slot-trigger');
            const mobileLabel = document.getElementById('mobile-slot-label');

            grid.innerHTML = '';
            modalGrid.innerHTML = '';
            hiddenInput.value = '';
            btnSubmit.disabled = true;

            // Inject skeletons
            for (let i = 0; i < 12; i++) {
                grid.innerHTML += '<div class="skeleton skeleton-slot"></div>';
                modalGrid.innerHTML += '<div class="skeleton skeleton-slot"></div>';
            }

            // Reset mobile trigger
            mobileTrigger.classList.remove('has-selection');
            mobileLabel.textContent = t('slot_select_prompt');

            if(SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE'){
                 grid.innerHTML = '';
                 modalGrid.innerHTML = '';
                 showAlert('booking', 'error', 'Error: Please configure the SCRIPT_URL in the HTML file first.');
                 return;
            }

            // Check for weekends
            const [y, m, d] = date.split('-');
            const selectedDateObj = new Date(y, m - 1, d);
            const dayOfWeek = selectedDateObj.getDay();
            
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--error-text); padding: 1.5rem; background: var(--error-bg); border-radius: var(--radius);">' + t('weekend_closed_msg') + '</div>';
                modalGrid.innerHTML = '<div style="text-align: center; color: var(--error-text); padding: 1.5rem;">' + t('weekend_closed_modal') + '</div>';
                showAlert('booking', 'error', t('toast_slots_weekend'));
                return;
            }

            try {
                const response = await fetch(`${SCRIPT_URL}?action=slots&date=${date}`);
                const data = await response.json();

                grid.innerHTML = '';
                modalGrid.innerHTML = '';

                // Check if date is blocked by admin
                if (data.blocked) {
                    const reason = data.reason || '';
                    const msg = reason
                        ? t('date_blocked_reason_msg').replace('%s', reason)
                        : t('date_blocked_msg');
                    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--error-text); padding: 1.5rem; background: var(--error-bg); border-radius: var(--radius);">' + escapeHTML(msg) + '</div>';
                    modalGrid.innerHTML = '<div style="text-align: center; color: var(--error-text); padding: 1.5rem;">' + escapeHTML(msg) + '</div>';
                    showAlert('booking', 'error', msg);
                    return;
                }

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
                grid.innerHTML = '';
                modalGrid.innerHTML = '';
                showAlert('booking', 'error', t('toast_slots_error'));
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
                        <span class="file-name">${escapeHTML(f.name)}</span>
                        <span class="file-size">${sizeStr}${escapeHTML(errorNote)}</span>
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
                showAlert('booking', 'error', t('toast_invalid_files'));
                return;
            }

            // Real-time validation check
            if (!validateAllFields()) {
                showAlert('booking', 'error', t('toast_form_errors'));
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
                    showAlert('booking', 'success', t('toast_booking_success'));
                    document.getElementById('booking-form').reset();
                    selectedFiles = [];
                    renderFileList();
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('date-picker').value = today;
                    currentDate = today;
                    fetchSlots(currentDate);
                } else {
                    showAlert('booking', 'error', result.message || t('toast_booking_error'));
                    fetchSlots(currentDate);
                }
            } catch (err) {
                showAlert('booking', 'error', err.message || t('toast_network_error'));
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
            
            const btn = document.querySelector('#admin-login button');
            if (!btn) {
                await doLogin(pass);
                return;
            }
            const originalText = btn.textContent;
            btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2); width: 14px; height: 14px; display: inline-block;"></div>';
            btn.disabled = true;

            await doLogin(pass);

            btn.textContent = originalText;
            btn.disabled = false;
        }

        async function doLogin(pass) {
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'adminLogin', password: pass })
                });
                const result = await response.json();

                if (result.success) {
                    adminToken = result.token;
                    document.getElementById('admin-login').style.display = 'none';
                    document.getElementById('admin-content').style.display = 'block';
                    loadAdminData();
                    loadBlockedDates();
                } else {
                    showAlert('admin', 'error', result.message || t('toast_login_error'));
                }
            } catch (err) {
                showAlert('admin', 'error', t('toast_login_network'));
            }
        }

        function logoutAdmin() {
            adminToken = null;
            document.getElementById('admin-login').style.display = 'flex';
            document.getElementById('admin-content').style.display = 'none';
            document.getElementById('admin-pass').value = '';
        }

        // =====================================================================
        //  ADMIN — Blocked Dates Management
        // =====================================================================
        async function loadBlockedDates() {
            const listEl = document.getElementById('blocked-dates-list');
            if (!listEl) return;

            try {
                const response = await fetch(`${SCRIPT_URL}?action=blockedDates&token=${adminToken}`);
                const data = await response.json();

                if (data.success === false) {
                    listEl.innerHTML = '<div style="color:var(--error-text);font-size:0.82rem;padding:0.5rem 0;">' + data.message + '</div>';
                    if (data.message && data.message.includes('Unauthorized')) logoutAdmin();
                    return;
                }

                renderBlockedDatesList(data);
            } catch (err) {
                listEl.innerHTML = '<div style="color:var(--error-text);font-size:0.82rem;padding:0.5rem 0;">Failed to load blocked dates.</div>';
            }
        }

        function renderBlockedDatesList(dates) {
            const listEl = document.getElementById('blocked-dates-list');
            if (!listEl) return;

            if (!dates || !Array.isArray(dates) || dates.length === 0) {
                listEl.innerHTML = '<div style="color:var(--ink-muted);font-size:0.82rem;padding:0.5rem 0;">' + t('blocked_dates_empty') + '</div>';
                return;
            }

            // Filter out entries that don't have a valid Date field (safety check for old backend)
            dates = dates.filter(function(item) {
                return item && item.Date && /^\d{4}-\d{2}-\d{2}$/.test(String(item.Date));
            });

            if (dates.length === 0) {
                listEl.innerHTML = '<div style="color:var(--ink-muted);font-size:0.82rem;padding:0.5rem 0;">' + t('blocked_dates_empty') + '</div>';
                return;
            }

            dates.sort((a, b) => String(a.Date || '').localeCompare(String(b.Date || '')));

            let html = '';
            dates.forEach(function(item) {
                const date = escapeHTML(String(item.Date || ''));
                const reason = escapeHTML(String(item.Reason || ''));

                let displayDate = date;
                try {
                    const parts = date.split('-');
                    const d = new Date(parts[0], parts[1] - 1, parts[2]);
                    displayDate = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                } catch(e) {}

                html += '<div class="blocked-date-item">' +
                    '<div class="blocked-date-info">' +
                        '<span class="blocked-date-badge">' + displayDate + '</span>' +
                        (reason ? '<span class="blocked-date-reason">' + reason + '</span>' : '') +
                    '</div>' +
                    '<button type="button" class="btn-unblock" onclick="unblockDate(\'' + date + '\')">' + t('btn_unblock') + '</button>' +
                '</div>';
            });

            listEl.innerHTML = html;
        }

        async function blockDate() {
            const datePicker = document.getElementById('block-date-picker');
            const reasonInput = document.getElementById('block-reason');
            const dateStr = datePicker.value;
            const reason = reasonInput.value.trim();

            if (!dateStr) {
                showAlert('admin', 'error', 'Please select a date to block.');
                return;
            }

            const btn = document.querySelector('[onclick="blockDate()"]');
            const originalText = btn.textContent;
            btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2); width:14px; height:14px; display:inline-block;"></div>';
            btn.disabled = true;

            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'blockDate', date: dateStr, reason: reason, token: adminToken })
                });
                const result = await response.json();

                if (result.success) {
                    const msg = result.deletedCount > 0
                        ? t('toast_date_blocked_with_count').replace('%d', result.deletedCount)
                        : t('toast_date_blocked');
                    showAlert('admin', 'success', msg);
                    datePicker.value = '';
                    reasonInput.value = '';
                    loadBlockedDates();
                } else {
                    showAlert('admin', 'error', result.message || t('toast_block_failed'));
                    if (result.message && result.message.includes('Unauthorized')) logoutAdmin();
                }
            } catch (err) {
                showAlert('admin', 'error', t('toast_block_failed'));
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }

        async function unblockDate(dateStr) {
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'unblockDate', date: dateStr, token: adminToken })
                });
                const result = await response.json();

                if (result.success) {
                    showAlert('admin', 'success', t('toast_date_unblocked'));
                    loadBlockedDates();
                } else {
                    showAlert('admin', 'error', result.message || t('toast_unblock_failed'));
                    if (result.message && result.message.includes('Unauthorized')) logoutAdmin();
                }
            } catch (err) {
                showAlert('admin', 'error', t('toast_unblock_failed'));
            }
        }

        // =====================================================================
        //  ADMIN — Load bookings for a specific date
        // =====================================================================
        async function loadAdminData() {
            const filterDate = document.getElementById('admin-date-picker').value;
            const tbody = document.getElementById('admin-tbody');
            const title = document.getElementById('admin-title');
            
            const skeletonRow = '<tr><td colspan="7"><div style="display:flex;gap:15px;align-items:center;"><div class="skeleton skeleton-text short" style="width:100px;margin:0;"></div><div class="skeleton skeleton-text" style="flex:1;margin:0;"></div><div class="skeleton skeleton-text short" style="width:80px;margin:0;"></div></div></td></tr>';
            tbody.innerHTML = skeletonRow.repeat(5);

            try {
                const response = await fetch(`${SCRIPT_URL}?action=bookings&token=${adminToken}`);
                const data = await response.json();

                if (data.success === false) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error-text);">${data.message}</td></tr>`;
                    if (data.message.includes('Unauthorized')) logoutAdmin();
                    return;
                }

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
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error-text);">' + t('toast_load_failed') + '</td></tr>';
            }
        }

        // =====================================================================
        //  ADMIN — Show ALL bookings (no date filter)
        // =====================================================================
        async function loadAllBookings() {
            document.getElementById('admin-date-picker').value = '';
            const tbody = document.getElementById('admin-tbody');
            const title = document.getElementById('admin-title');
            
            const skeletonRow = '<tr><td colspan="7"><div style="display:flex;gap:15px;align-items:center;"><div class="skeleton skeleton-text short" style="width:100px;margin:0;"></div><div class="skeleton skeleton-text" style="flex:1;margin:0;"></div><div class="skeleton skeleton-text short" style="width:80px;margin:0;"></div></div></td></tr>';
            tbody.innerHTML = skeletonRow.repeat(5);

            try {
                const response = await fetch(`${SCRIPT_URL}?action=bookings&token=${adminToken}`);
                const data = await response.json();

                if (data.success === false) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error-text);">${data.message}</td></tr>`;
                    if (data.message.includes('Unauthorized')) logoutAdmin();
                    return;
                }

                allBookingsCache = data;
                title.textContent = `All Bookings (${data.length})`;
                renderAdminTable(data);
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error-text);">' + t('toast_load_failed') + '</td></tr>';
            }
        }

        // =====================================================================
        //  ADMIN — Render the table rows
        // =====================================================================
        function renderAdminTable(rows) {
            const tbody = document.getElementById('admin-tbody');
            tbody.innerHTML = '';

            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--ink-muted);">' + t('toast_no_bookings') + '</td></tr>';
                return;
            }

            rows.sort((a, b) => {
                const slotA = getVal(a, ['Assigned Slot', 'Slot'], '');
                const slotB = getVal(b, ['Assigned Slot', 'Slot'], '');
                return String(slotA).localeCompare(String(slotB));
            });

            rows.forEach((row, i) => {
                const name    = escapeHTML(getVal(row, ['name', 'Name', 'Name / \u0928\u093e\u0935', 'Full Name', '\u0928\u093e\u0935'], '\u2014'));
                const phone   = escapeHTML(getVal(row, ['phone', 'Phone', 'Phone number / \u092b\u094b\u0928 \u0928\u0902\u092c\u0930', 'Phone Number', '\u092b\u094b\u0928 \u0928\u0902\u092c\u0930'], ''));
                const email   = escapeHTML(getVal(row, ['email', 'Email', 'Email / \u0908-\u092e\u0947\u0932', 'Email Address', '\u0908-\u092e\u0947\u0932'], '\u2014'));
                const station = escapeHTML(getVal(row, ['station', 'Police station / \u092a\u094b\u0932\u0940\u0938 \u0938\u094d\u091f\u0947\u0936\u0928', 'Police Station', '\u092a\u094b\u0932\u0940\u0938 \u0938\u094d\u091f\u0947\u0936\u0928'], '\u2014'));
                const slot    = escapeHTML(getVal(row, ['Assigned Slot', 'assigned slot', 'Slot'], '\u2014'));
                const link    = getVal(row, ['Meet Link', 'meet link'], '');
                const status  = escapeHTML(getVal(row, ['Status', 'status'], 'Unknown'));
                const docs    = getVal(row, ['Documents', 'documents', 'Docs'], '');
                const purpose = escapeHTML(getVal(row, ['Complaint details / \u0924\u0915\u094d\u0930\u093e\u0930 ( short / \u0925\u094b\u0921\u0915\u094d\u092f\u093e\u0924 )', 'purpose', 'Purpose', 'Complaint Details', 'Complaint details', '\u0924\u0915\u094d\u0930\u093e\u0930'], '\u2014'));

                const timeOnly    = escapeHTML(extractTime(String(slot)));
                const statusClass = String(status).includes('Failed') ? 'failed' : 'processed';
                
                let validLink = '';
                if (link && typeof link === 'string' && link.startsWith('http')) validLink = link;
                const linkHtml    = validLink && validLink !== '\u2014' ? `<a href="${escapeHTML(validLink)}" target="_blank">${t('join_meet')}</a>` : '\u2014';

                // Build docs column
                let docsHtml = '\u2014';
                if (docs && docs !== '\u2014' && docs.trim() !== '') {
                    const docLinks = docs.split(',').map(l => l.trim()).filter(l => l.startsWith('http'));
                    if (docLinks.length === 1) {
                        docsHtml = `<button type="button" class="doc-preview-btn" onclick="openDocPreview('${escapeHTML(docLinks[0])}', '${escapeHTML(name)}')">${t('preview')}</button>`;
                    } else if (docLinks.length > 1) {
                        docsHtml = docLinks.map((l, idx) => `<button type="button" class="doc-preview-btn" onclick="openDocPreview('${escapeHTML(l)}', '${escapeHTML(name)} - ${t('doc_prefix')} ${idx + 1}')">${t('doc_prefix')} ${idx + 1}</button>`).join(' ');
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
                        <td><button type="button" class="doc-preview-btn" style="color:var(--error-text);border-color:rgba(176,0,32,0.3);" onclick="event.stopPropagation(); confirmDeleteBooking('${escapeHTML(String(slot)).replace(/'/g, "\\'")}', '${escapeHTML(String(phone)).replace(/'/g, "\\'")}')">${t('btn_delete')}</button></td>
                    </tr>
                    <tr class="detail-row" id="${detailId}" style="display:none;">
                        <td colspan="7">
                            <div class="detail-row-content">
                                <span class="detail-label">${t('detail_label')}</span>
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

        // Alert Helper (Now Toast Notifications)
        function showAlert(view, type, message) {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            // Add icon based on type
            let icon = '';
            if (type === 'success') icon = '✓';
            else if (type === 'error') icon = '⚠';
            else icon = 'ℹ';

            const iconSpan = document.createElement('span');
            iconSpan.style.fontSize = '1.2rem';
            iconSpan.textContent = icon;
            
            const msgSpan = document.createElement('span');
            msgSpan.textContent = message;
            
            toast.appendChild(iconSpan);
            toast.appendChild(document.createTextNode(' '));
            toast.appendChild(msgSpan);
            
            container.appendChild(toast);

            // Remove after animation (4.6s + 0.4s fadeOut)
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);
        }

        // =====================================================================
        //  DELETE CONFIRMATION MODAL
        // =====================================================================
        function confirmDeleteBooking(slot, phone) {
            const overlay = document.getElementById('delete-confirm-overlay');
            const msg = document.getElementById('delete-confirm-message');
            const btn = document.getElementById('delete-confirm-btn');
            
            const timeOnly = escapeHTML(extractTime(slot));
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

            const payload = { action: 'delete', slot: slot, phone: phone, token: adminToken };

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
                    if (result.message && result.message.includes('Unauthorized')) logoutAdmin();
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

        // =====================================================================
        //  REAL-TIME VALIDATION
        // =====================================================================
        const formFields = [
            'form-name', 'form-phone', 'form-email', 
            'form-station', 'form-address', 'form-purpose'
        ];

        function getWordCount(str) {
            return str.trim().split(/\s+/).filter(word => word.length > 0).length;
        }

        function validateField(el, isBlur) {
            let isValid = true;
            let errorMsg = '';
            
            // Mark as touched on blur
            if (isBlur) el.dataset.touched = 'true';
            
            const isTouched = el.dataset.touched === 'true';

            // Base Native HTML Validation
            if (!el.checkValidity()) {
                isValid = false;
                errorMsg = el.validationMessage;
            }

            // Custom Purpose (Word Count) logic
            if (el.id === 'form-purpose' && el.value.trim().length > 0) {
                const words = getWordCount(el.value);
                if (words > 300) {
                    isValid = false;
                    errorMsg = `Maximum 300 words allowed. Currently at ${words} words.`;
                }
            }

            // Custom Phone logic (ensure exactly 10 digits if valid otherwise)
            if (el.id === 'form-phone' && el.value.length > 0 && !/^\d{10}$/.test(el.value)) {
                isValid = false;
                errorMsg = 'Please enter exactly a 10-digit phone number.';
            }

            const msgEl = el.nextElementSibling;

            if (isValid && el.value.trim() !== '') {
                // Eager valid
                el.classList.add('is-valid');
                el.classList.remove('is-invalid');
                if (msgEl) msgEl.textContent = '';
            } else if (!isValid && isTouched) {
                // Lazy invalid (only show error if touched)
                el.classList.remove('is-valid');
                el.classList.add('is-invalid');
                if (msgEl) msgEl.textContent = errorMsg;
            } else {
                // Reset styling if empty or untouched invalid
                el.classList.remove('is-valid');
                el.classList.remove('is-invalid');
                if (msgEl) msgEl.textContent = '';
            }
            
            return isValid;
        }

        formFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => validateField(el, false));
                el.addEventListener('blur', () => validateField(el, true));
                el.addEventListener('change', () => validateField(el, false)); // For select
            }
        });

        function validateAllFields() {
            let allValid = true;
            formFields.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (!validateField(el, true)) {
                        allValid = false;
                    }
                }
            });
            return allValid;
        }

        // =====================================================================
        //  ADMIN — Export Bookings to CSV
        // =====================================================================
        async function exportCSV() {
            const filterDate = document.getElementById('admin-date-picker').value;

            if (!filterDate) {
                showAlert('admin', 'error', t('toast_csv_error') || 'Please select a date first, then click Export CSV.');
                return;
            }

            // Find button safely (onclick="exportCSV()" doesn't pass event)
            const btn = document.querySelector('[data-i18n="btn_export_csv"]');
            let originalText = '';
            if (btn) {
                originalText = btn.textContent;
                btn.innerHTML = '<div class="loader" style="border-top-color:#fff;border-color:rgba(255,255,255,0.2); width:14px; height:14px; display:inline-block;"></div>';
                btn.disabled = true;
            }

            try {
                const params = new URLSearchParams({
                    action: 'exportCsv',
                    token: adminToken,
                    startDate: filterDate,
                    endDate: filterDate
                });

                const response = await fetch(`${SCRIPT_URL}?${params.toString()}`);

                // Read body as text ONCE (avoids "body already read" error)
                const text = await response.text();

                // Try to parse as JSON — if it's an error response from the backend
                try {
                    const result = JSON.parse(text);
                    if (result.success === false) {
                        showAlert('admin', 'error', result.message || t('toast_csv_error'));
                        if (result.message && result.message.includes('Unauthorized')) logoutAdmin();
                        return;
                    }
                } catch (jsonErr) {
                    // Not JSON — this means it's CSV data, continue below
                }

                // Create a blob from the text and trigger download
                const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8;' });
                const url  = window.URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href     = url;
                a.download = `bookings_${filterDate}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                showAlert('admin', 'success', t('toast_csv_error') ? 'CSV exported!' : 'CSV exported successfully!');
            } catch (err) {
                showAlert('admin', 'error', t('toast_csv_error') || 'Network error during export. Please try again.');
            } finally {
                if (btn) {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            }
        }