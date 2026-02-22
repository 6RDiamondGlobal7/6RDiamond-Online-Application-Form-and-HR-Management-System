const supabase = require('../config/supabaseClient');

// --- Helper Function: Upload Single File ---
const uploadFileToSupabase = async (fileObject) => {
    if (!fileObject) return null;
    
    const file = fileObject[0]; // Multer gives an array
    const fileName = `${Date.now()}_${file.originalname}`;
    
    // Upload to 'resumes' bucket
    const { data, error } = await supabase
        .storage
        .from('resumes')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype
        });

    if (error) throw error;

    // Get Public URL
    const { data: publicUrlData } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(fileName);
        
    return publicUrlData.publicUrl;
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toISOString().slice(0, 10);
};

const normalizeStatus = (status) => {
    const clean = String(status || '').trim().toLowerCase();
    if (clean === 'hired') return 'Hired';
    if (clean === 'rejected') return 'Rejected';
    if (clean === 'interview') return 'Interview';
    return 'Applied';
};

const percentage = (part, total) => {
    if (!total) return 0;
    return Number(((part / total) * 100).toFixed(1));
};

const toIntegerInRange = (value, min, max, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < min || parsed > max) return fallback;
    return parsed;
};

const getPeriodConfig = ({ reportType, month, quarter, year }) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const safeYear = toIntegerInRange(year, 2000, 2100, currentYear);
    const normalizedType = String(reportType || 'monthly').toLowerCase();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (normalizedType === 'annual') {
        const start = `${safeYear}-01-01`;
        const end = `${safeYear + 1}-01-01`;
        return {
            reportType: 'annual',
            startDate: start,
            endDate: end,
            label: `${safeYear} Annual Report`,
            filter: { year: safeYear }
        };
    }

    if (normalizedType === 'quarterly') {
        const safeQuarter = toIntegerInRange(quarter, 1, 4, Math.floor(now.getMonth() / 3) + 1);
        const startMonth = (safeQuarter - 1) * 3;
        const endMonth = startMonth + 3;
        const start = new Date(Date.UTC(safeYear, startMonth, 1)).toISOString().slice(0, 10);
        const end = new Date(Date.UTC(safeYear, endMonth, 1)).toISOString().slice(0, 10);
        return {
            reportType: 'quarterly',
            startDate: start,
            endDate: end,
            label: `Q${safeQuarter} ${safeYear} Report`,
            filter: { year: safeYear, quarter: safeQuarter }
        };
    }

    const safeMonth = toIntegerInRange(month, 1, 12, now.getMonth() + 1);
    const start = new Date(Date.UTC(safeYear, safeMonth - 1, 1)).toISOString().slice(0, 10);
    const end = new Date(Date.UTC(safeYear, safeMonth, 1)).toISOString().slice(0, 10);
    return {
        reportType: 'monthly',
        startDate: start,
        endDate: end,
        label: `${monthNames[safeMonth - 1]} ${safeYear} Report`,
        filter: { year: safeYear, month: safeMonth }
    };
};

// --- Controller Functions ---

// 1. Test Database Connection
exports.testDb = async (req, res) => {
    try {
        const { data, error } = await supabase.from('jobpostings').select('job_id').limit(1);
        if (error) throw error;
        res.json({ status: "Success", message: "Connected to Supabase!", data });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err.message });
    }
};

// 2. Get Jobs
exports.getJobs = async (req, res) => {
    try {
        const { data, error } = await supabase.from('jobpostings').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Submit Application
exports.submitApplication = async (req, res) => {
    const files = req.files || {};
    
    const {
        firstName, lastName, middleInitial, suffix,
        nationality, birthday, age, email, contactNumber,
        region, province, city, barangay, detailedAddress,
        medicalCondition, medicalDetails,
        branch, positionApplied 
    } = req.body;

    try {
        const applicantNo = 'APP-' + Date.now();
        const tempPassword = (lastName || 'USER').toUpperCase() + '123';

        const resumeUrl = await uploadFileToSupabase(files['resume']);
        const coverLetterUrl = await uploadFileToSupabase(files['coverLetter']);
        const prcIdUrl = await uploadFileToSupabase(files['prcId']);

        const cleanAge = parseInt(age) || 0; 
        const cleanContact = contactNumber ? contactNumber.replace(/\D/g, '') : null;

        // Truncate to avoid "value too long" database errors based on your schema
        const safeMiddleInitial = middleInitial ? middleInitial.substring(0, 5) : null;
        const safeSuffix = suffix ? suffix.substring(0, 10) : null;

        const { data, error } = await supabase
            .from('applicant') 
            .insert([{ 
                applicant_no: applicantNo,
                password: tempPassword,
                first_name: firstName,
                last_name: lastName,
                middle_initial: safeMiddleInitial,
                suffix: safeSuffix,
                nationality: nationality,
                birthday: birthday,
                age: cleanAge,
                email: email,
                contact_number: cleanContact,
                region: region,
                province: province,
                city_municipality: city,
                barangay: barangay,
                detailed_address: detailedAddress,
                resume_url: resumeUrl,
                cover_letter_url: coverLetterUrl,
                prc_id_url: prcIdUrl,
                medical_condition: medicalCondition || 'no',
                medical_details: medicalDetails || null,
                branch: branch || 'Not specified',
                position_applied: positionApplied || 'Not specified'
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: "Application submitted!", applicantId: applicantNo });

    } catch (err) {
        console.error("Server Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 4. Get All Applicants
exports.getApplicants = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('applicant')
            .select(`
                applicant_no, first_name, last_name, middle_initial, suffix,
                nationality, birthday, age, email, contact_number,
                region, province, city_municipality, barangay, detailed_address,
                resume_url, cover_letter_url, medical_condition, medical_details,
                branch, position_applied
            `)
            .order('applicant_no', { ascending: false });

        if (error) throw error;

        const formattedData = data.map(app => ({
            id: app.applicant_no || 'N/A',
            name: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
            firstName: app.first_name,
            lastName: app.last_name,
            middleInitial: app.middle_initial,
            nationality: app.nationality,
            birthday: app.birthday,
            age: app.age,
            email: app.email || 'N/A',
            phone: app.contact_number || 'N/A',
            region: app.region,
            province: app.province,
            city: app.city_municipality,
            barangay: app.barangay,
            detailedAddress: app.detailed_address,
            resume_url: app.resume_url,
            cover_letter_url: app.cover_letter_url,
            medicalCondition: app.medical_condition,
            medicalDetails: app.medical_details,
            status: 'Applied', 
            branch: app.branch || 'Not assigned',
            position: app.position_applied || 'Not assigned'
        }));

        res.json(formattedData);
    } catch (err) {
        console.error('Error fetching applicants:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// 5. Reports
exports.getReports = async (req, res) => {
    try {
        const period = getPeriodConfig(req.query || {});
        const { data, error } = await supabase
            .from('applicant')
            .select('*')
            .order('applicant_no', { ascending: false });

        if (error) throw error;

        const startMs = new Date(`${period.startDate}T00:00:00.000Z`).getTime();
        const endMs = new Date(`${period.endDate}T00:00:00.000Z`).getTime();

        const inferDate = (app) => {
            if (app.created_at || app.createdAt) return app.created_at || app.createdAt;
            if (app.applied_date || app.appliedDate) return app.applied_date || app.appliedDate;
            if (app.date_created || app.dateCreated) return app.date_created || app.dateCreated;
            if (app.created_on || app.createdOn) return app.created_on || app.createdOn;

            const match = String(app.applicant_no || '').match(/APP-(\d{10,13})/i);
            if (!match) return null;
            const ts = Number(match[1]);
            if (Number.isNaN(ts)) return null;
            return new Date(ts).toISOString();
        };

        const records = (data || [])
            .map((app) => {
                const appliedRaw = inferDate(app);
                const appliedMs = appliedRaw ? new Date(appliedRaw).getTime() : Number.NaN;
                return {
                    id: app.applicant_no || 'N/A',
                    name: `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'N/A',
                    email: app.email || 'N/A',
                    phone: app.contact_number || 'N/A',
                    status: normalizeStatus(app.status || 'Applied'),
                    position: app.position_applied || 'Not assigned',
                    branch: app.branch || 'Not assigned',
                    dateRaw: appliedRaw,
                    appliedMs
                };
            })
            .filter((row) => !Number.isNaN(row.appliedMs) && row.appliedMs >= startMs && row.appliedMs < endMs)
            .map((row) => ({
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                status: row.status,
                position: row.position,
                branch: row.branch,
                date: formatDate(row.dateRaw)
            }));

        const total = records.length;
        const statusBreakdown = records.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, { Applied: 0, Interview: 0, Hired: 0, Rejected: 0 });

        const summary = {
            totalApplications: total,
            newApplications: statusBreakdown.Applied,
            interviewCount: statusBreakdown.Interview,
            hiredCount: statusBreakdown.Hired,
            rejectedCount: statusBreakdown.Rejected,
            interviewRate: percentage(statusBreakdown.Interview, total),
            hiringRate: percentage(statusBreakdown.Hired, total),
            rejectionRate: percentage(statusBreakdown.Rejected, total)
        };

        res.json({
            meta: {
                reportType: period.reportType,
                label: period.label,
                dateRange: {
                    from: period.startDate,
                    to: period.endDate
                },
                filter: period.filter
            },
            summary,
            statusBreakdown,
            records
        });
    } catch (err) {
        console.error('Error generating report:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// 6. Update Applicant Status
exports.updateApplicantStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data, error } = await supabase
            .from('applicantfacttable') 
            .update({ status: status })
            .eq('applicant_id', id);

        if (error) throw error;

        res.json({ message: `Status updated to ${status} successfully`, data });
    } catch (err) {
        console.error('Error updating status:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// 7. Employee Login
exports.loginEmployee = async (req, res) => {
    const { employeeId, password } = req.body;

    try {
        // 1. Check if user exists in Supabase
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('employee_id', employeeId)
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Invalid Employee ID or Password' });
        }

        // 2. Simple Password Check 
        if (data.password !== password) {
            return res.status(401).json({ error: 'Invalid Employee ID or Password' });
        }

        // 3. Login Successful
        res.json({ 
            message: "Login successful", 
            user: { 
                id: data.employee_id, 
                name: `${data.first_name} ${data.last_name}`,
                role: data.role 
            } 
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
