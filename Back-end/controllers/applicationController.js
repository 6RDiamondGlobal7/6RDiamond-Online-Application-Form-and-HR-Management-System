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

// 5. Update Applicant Status
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

// 6. Employee Login
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