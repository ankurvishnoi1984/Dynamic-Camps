
const db = require("../config/db")
const logger = require('../utils/logger')


exports.loginWithEmpCode = async (req, res) => {
  const { empcode, password,deptId=0 } = req.body;
  let query = ""
  let params = [empcode]
  if (deptId===0){
   query = 'select user_id, empcode, password, email, role, designation from user_mst where empcode=?';
  }else{
    query = 'select user_id, empcode, password, email, role, designation from user_mst where empcode=? and dept_id = ?';
    params.push(deptId)
  }

  try {
    db.query(query, params, (err, result) => {
      if (err) {
        logger.error(`Error in /controller/auth/login: ${err.message}`);
        return res.status(500).json({
          errorCode: "0",
          errorDetail: err.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      } else if (result.length === 0) {
        return res.status(401).json({
          errorCode: "0",
          errorDetail: "Invalid User or Password",
          responseData: {},
          status: "ERROR",
          details: "UNAUTHORIZED",
          getMessageInfo: "Invalid User or Password"
        });
      } else {
        const user = result[0];
        if (password == user.password) {
          const loginTime = new Date();
          const historyQuery = 'insert into user_login_history (user_id, login_datetime,dept_id) values (?, ?,?)';
          db.query(historyQuery, [user.user_id, loginTime,deptId], (err, result) => {
            if (err) {
              logger.error(`Error in /controller/auth/login: ${err.message}`);
              return res.status(500).json({
                errorCode: "0",
                errorDetail: err.message,
                responseData: {},
                status: "ERROR",
                details: "An internal server error occurred",
                getMessageInfo: "An internal server error occurred"
              });
            } else {
              const historyId = result.insertId;
              return res.json({
                errorCode: "1",
                errorDetail: "",
                responseData: {
                  message: "Login successful",
                  empId: user.empcode,
                  user_id: user.user_id,
                  role: user.role,
                  sessionID:historyId,
                  designation:user.designation,
                },
                status: "SUCCESS",
                details: "",
                getMessageInfo: ""
              });
            }
          });
        } else {
          return res.status(401).json({
            errorCode: "UNAUTHORIZED",
            errorDetail: "Invalid User or Password",
            responseData: {},
            status: "ERROR",
            details: "Invalid User or Password",
            getMessageInfo: "Invalid User or Password"
          });
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      errorCode: "0",
      errorDetail: error.message,
      responseData: {},
      status: "ERROR",
      details: "An internal server error occurred",
      getMessageInfo: "An internal server error occurred"
    });
  }
};

exports.login = async (req, res) => {
  const { usernamehq, password } = req.body;  // changed from email to usernamehq
  const query = 'SELECT user_id, usernamehq,empcode, password, role, designation, name FROM user_mst WHERE usernamehq=? AND status="Y"';

  try {
    db.query(query, [usernamehq], (err, result) => {
      if (err) {
        logger.error(`Error in /controller/auth/login: ${err.message}`);
        return res.status(500).json({
          errorCode: "0",
          errorDetail: err.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      } else if (result.length === 0) {
        return res.status(401).json({
          errorCode: "0",
          errorDetail: "Invalid Username or Password",
          responseData: {},
          status: "ERROR",
          details: "UNAUTHORIZED",
          getMessageInfo: "Invalid Username or Password"
        });
      } else {
        const user = result[0];

        if (password == user.password) {  // Plaintext check, consider hashing later
          const loginTime = new Date();
          const historyQuery = 'INSERT INTO user_login_history (user_id, login_datetime) VALUES (?, ?)';

          db.query(historyQuery, [user.user_id, loginTime], (err, result) => {
            if (err) {
              logger.error(`Error in /controller/auth/login: ${err.message}`);
              return res.status(500).json({
                errorCode: "0",
                errorDetail: err.message,
                responseData: {},
                status: "ERROR",
                details: "An internal server error occurred",
                getMessageInfo: "An internal server error occurred"
              });
            } else {
              const historyId = result.insertId;
              return res.json({
                errorCode: "1",
                errorDetail: "",
                responseData: {
                  message: "Login successful",
                  usernamehq: user.usernamehq,
                  user_id: user.user_id,
                  empId: user.empcode,
                  role: user.role,
                  designation: user.designation,
                  sessionID: historyId,
                  name: user.name,
                },
                status: "SUCCESS",
                details: "",
                getMessageInfo: ""
              });
            }
          });
        } else {
          return res.status(401).json({
            errorCode: "0",
            errorDetail: "Invalid Username or Password",
            responseData: {},
            status: "ERROR",
            details: "Invalid Username or Password",
            getMessageInfo: "Invalid Username or Password"
          });
        }
      }
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({
      errorCode: "0",
      errorDetail: error.message,
      responseData: {},
      status: "ERROR",
      details: "An internal server error occurred",
      getMessageInfo: "An internal server error occurred"
    });
  }
};
exports.logout = async (req, res) => {
  const {sessionId } = req.body;
  const logoutTime = new Date();
  const query = 'update user_login_history set logout_datetime =? where lh_id = ?'
  try {
    db.query(query, [logoutTime,sessionId], (err, result) => {
      if (err) {
      logger.error(err.message);

        res.status(500).json({
          errorCode: "0",
          errorDetail: err.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      }
      else{
        res.status(200).json({ message: "Logout Successfully",errorCode: "1"})
      } 
    });
  } catch (error) {
    logger.error(error.message);
    res.send(error)
  }
};






