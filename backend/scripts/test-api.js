import axios from 'axios';

const testApi = async () => {
    try {
        // Step 1: Fetch all schemes
        const schemesResponse = await axios.get('http://localhost:5000/schemes');
        const schemes = schemesResponse.data;
        console.log(`Total schemes: ${schemes.length}`);
        
        if (schemes.length === 0) {
            console.log("NO SCHEMES FOUND - database is empty!");
            process.exit(1);
        }
        
        const first = schemes[0];
        console.log("First scheme _id:", first._id);
        console.log("First scheme _id type:", typeof first._id);
        console.log("First scheme keys:", Object.keys(first));
        
        // Step 2: Try to fetch detail by that ID
        console.log(`\nFetching detail: /schemes/${first._id}`);
        try {
            const detailRes = await axios.get(`http://localhost:5000/schemes/${first._id}`);
            console.log("DETAIL SUCCESS:", JSON.stringify(detailRes.data, null, 2));
        } catch(detailErr) {
            console.log("DETAIL FAILED:", detailErr.response?.status, detailErr.response?.data);
        }

    } catch(err) {
        console.error("LIST FAILED:", err.message);
    }
};

testApi();
