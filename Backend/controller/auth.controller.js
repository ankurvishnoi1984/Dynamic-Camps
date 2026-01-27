
const db = require("../config/db")
const logger = require('../utils/logger')


exports.loginWithEmpCode = async (req, res) => {
  const { empcode, password } = req.body;

  const userQuery = `
    SELECT 
      u.user_id,
      u.empcode,
      u.password,
      u.email,
      u.role,
      u.designation,
      u.dept_id,
      d.view_poster,
      d.view_camp
    FROM user_mst u
    LEFT JOIN department_mst d ON d.dept_id = u.dept_id
    WHERE u.empcode = ?
  `;

  try {
    db.query(userQuery, [empcode], (err, result) => {
      if (err) {
        logger.error(`Error in loginWithEmpCode: ${err.message}`);
        return res.status(500).json({
          errorCode: "0",
          errorDetail: err.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
        });
      }

      if (!result.length) {
        return res.status(401).json({
          errorCode: "0",
          errorDetail: "Invalid User or Password",
          responseData: {},
          status: "ERROR",
          details: "UNAUTHORIZED",
          getMessageInfo: "Invalid User or Password"
        });
      }

      const user = result[0];

      if (password !== user.password) {
        return res.status(401).json({
          errorCode: "0",
          errorDetail: "Invalid User or Password",
          responseData: {},
          status: "ERROR",
          details: "Invalid User or Password",
          getMessageInfo: "Invalid User or Password"
        });
      }

      const loginTime = new Date();
      const historyQuery = `
        INSERT INTO user_login_history (user_id, login_datetime, dept_id)
        VALUES (?, ?, ?)
      `;

      db.query(
        historyQuery,
        [user.user_id, loginTime, user.dept_id],
        (err, historyResult) => {
          if (err) {
            logger.error(`Error in loginWithEmpCode: ${err.message}`);
            return res.status(500).json({
              errorCode: "0",
              errorDetail: err.message,
              responseData: {},
              status: "ERROR",
              details: "An internal server error occurred",
              getMessageInfo: "An internal server error occurred"
            });
          }

          return res.json({
            errorCode: "1",
            errorDetail: "",
            responseData: {
              message: "Login successful",
              empId: user.empcode,
              user_id: user.user_id,
              role: user.role,
              designation: user.designation,
              sessionID: historyResult.insertId,
              view_poster: user.view_poster ?? 'N',
              view_camp: user.view_camp ?? 'N'
            },
            status: "SUCCESS",
            details: "",
            getMessageInfo: ""
          });
        }
      );
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






