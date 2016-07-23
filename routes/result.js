var express = require('express');
var router = express.Router();
var Pool = require('pg').Pool;


var config = {
  host: 'localhost',
  user: 'mathieu',
  password: 'none',
  database: 'goodbad',
  max: 10,
  idleTimeoutMillis: 30000
};


process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack);
});

var pool = new Pool(config);

router.get('/', function(req, res) {
  // TODO Security: Check the current user role?
  pool.query('SELECT * FROM public.result', function(err, result) {
    // handle an error from the query
    if (err) {return res.json(err);}
    res.json(result.rows);
  });
});

router.get('/:username', function(req, res) {
  // TODO Security: Could check the Username with current logued user ?
  var usernameid = req.params.username;
  pool.query('SELECT * FROM public.result WHERE username = ($1)', [usernameid], function(err, result) {
    // handle an error from the query
    if (err) {return res.json(err); }
    res.json(result.rows);
  });
});

router.post('/', function(req, res) {
  // $ curl --data "username=mathieuTest&filenameid=123422&success=false&positive_failed=true&delta_criteria_array=-2&user_comments=this should fail and have a positive fail." localhost:8010/result
  // $ curl --data "username=mathieuTest&filenameid=123423&success=false&fail_passed=true&delta_criteria_array=2&user_comments=this should fail and have a Failed Positive." localhost:8010/result

  var data = {
    'username': req.body.username,
    'filenameid': req.body.filenameid,
    'type': req.body.type || null,
    'success': req.body.success,
    'fail_passed': req.body.fail_passed || null,
    'positive_failed': req.body.positive_failed || null,
    'delta_criteria_array': req.body.delta_criteria_array || null,
    'inspection_date': new Date(),
    'user_comments': req.body.user_comments,
    'timeinsec': req.body.timeinsec
  };

  // Optimisation/refactor needed here once I understand more.
  pool.query('INSERT INTO result(username, filenameid, success, fail_passed, positive_failed, delta_criteria_array, inspection_date, user_comments) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [data.username, data.filenameid, data.success, data.fail_passed, data.positive_failed, data.delta_criteria_array, data.inspection_date, data.user_comments], function(err, result) {
    // handle an error from the query
    if (err) {return res.json(err);}
    // console.log(res.rows);
    res.json(result);
  });
});

router.delete('/id/:resultOid', function(req, res) {
  var resultOid = req.params.resultOid;
  pool.query('DELETE FROM public.result WHERE oid=($1)', [resultOid], function(err, result) {
    // handle an error from the query
    if (err) {return res.json(err);}
    res.json(result);
  });
});

router.delete('/all/:goldenImgId', function(req, res) {
  var goldenId = req.params.goldenImgId;
  pool.query('DELETE FROM public.result WHERE filenameid=($1)', [goldenId], function(err, result) {
    // handle an error from the query
    if (err) {return res.json(err);}
    res.json(result);
  });
});

module.exports = router;