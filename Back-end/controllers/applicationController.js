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
    console.log("Received Text Data:", req.body);
    
    const files = req.files || {};
    console.log("Received Files:", Object.keys(files));

    const {
        firstName, lastName, middleInitial, suffix,
        nationality, birthday, age, email, contactNumber,
        region, province, city, barangay, detailedAddress
    } = req.body;

    try {
        const applicantNo = 'APP-' + Date.now();
        const tempPassword = (lastName || 'USER').toUpperCase() + '123';

        // Upload the 3 files (if they exist)
        const resumeUrl = await uploadFileToSupabase(files['resume']);
        const coverLetterUrl = await uploadFileToSupabase(files['coverLetter']);
        const prcIdUrl = await uploadFileToSupabase(files['prcId']);

        // Data Cleaning
        const cleanAge = parseInt(age) || 0; 
        const cleanContact = contactNumber ? contactNumber.replace(/\D/g, '') : null;

        // Insert into Database
        const { data, error } = await supabase
            .from('applicant') 
            .insert([{ 
                applicant_no: applicantNo,
                password: tempPassword,
                first_name: firstName,
                last_name: lastName,
                middle_initial: middleInitial,
                suffix: suffix,
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
                prc_id_url: prcIdUrl
            }])
            .select();

        if (error) {
            console.error("Supabase Insert Error:", error);
            throw error;
        }

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
                applicant_no,
                first_name,
                last_name,
                email,
                contact_number
            `)
            .order('applicant_no', { ascending: false });

        if (error) throw error;

        const formattedData = data.map(app => ({
            id: app.applicant_no || 'N/A',
            name: `${app.first_name || ''} ${app.last_name || ''}`.trim(),
            email: app.email || 'N/A',
            phone: app.contact_number || 'N/A',
            date: 'N/A',
            status: 'Applied',
            position: 'Not assigned',
            branch: 'Not assigned'
        }));

        res.json(formattedData);

    } catch (err) {
        console.error('Error fetching applicants:', err.message);
        res.status(500).json({ error: err.message });
    }
}; // <--- FIXED: Added this closing brace to end getApplicants

// 5. Employee Login
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
