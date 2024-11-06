


app.get("/", (req, res) => {

    const sql = "SELECT * FROM staff"; 
    return {staff:reults};

});


app.get("/getStaff/:id", (req, res) => { 
    const staffId = req.params.id; 
    const sql = "SELECT * FROM staff WHERE id=?"; 
    

    connection.query(sql, [id], (error, staffResults) => {

            if (staffResults.length > 0) {
                const staffInfo = ('staff', { 
                    staff: staffResults[0]});
                return staffInfo;
            } else {
                const staffInfo = ("Staff not found");
                return staffInfo;
                
                 }});
    });





app.post("/enrolStaff", (req, res) => { 
    const { name, email } = req.body; 

    const sql = "INSERT INTO `staff` (`name`,`email`) VALUES (?, ?)"; 

    connection.query(sql, [name, email], (error, results) => { 
        if (error) {
            console.error("Error adding staff: ", error.message);
            return res.status(500).send("Error adding staff");
        } else {
            const msg="Staff Added";
            return msg
        }
    });
});


app.post('/editReview/:id', (req, res) => {
    const id = req.params.id;
    const { email } = req.body;

    const sql = "UPDATE staff SET email=? WHERE id=?";

    connection.query(sql, [email, id], (error, results) => {
        if (error) {
            console.error("Error updating email: ", error.message);
            return res.status(500).send("Error updating email");
        } else {
            const msg = ("Email updated");
            return msg;
        }
    });
});