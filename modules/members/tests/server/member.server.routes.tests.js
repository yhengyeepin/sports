'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Member = mongoose.model('Member'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, member;

/**
 * Member routes tests
 */
describe('Member CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Member
    user.save(function () {
      member = {
        name: 'Member name'
      };

      done();
    });
  });

  it('should be able to save a Member if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Member
        agent.post('/api/members')
          .send(member)
          .expect(200)
          .end(function (memberSaveErr, memberSaveRes) {
            // Handle Member save error
            if (memberSaveErr) {
              return done(memberSaveErr);
            }

            // Get a list of Members
            agent.get('/api/members')
              .end(function (membersGetErr, membersGetRes) {
                // Handle Member save error
                if (membersGetErr) {
                  return done(membersGetErr);
                }

                // Get Members list
                var members = membersGetRes.body;

                // Set assertions
                (members[0].user._id).should.equal(userId);
                (members[0].name).should.match('Member name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Member if not logged in', function (done) {
    agent.post('/api/members')
      .send(member)
      .expect(403)
      .end(function (memberSaveErr, memberSaveRes) {
        // Call the assertion callback
        done(memberSaveErr);
      });
  });

  it('should not be able to save an Member if no name is provided', function (done) {
    // Invalidate name field
    member.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Member
        agent.post('/api/members')
          .send(member)
          .expect(400)
          .end(function (memberSaveErr, memberSaveRes) {
            // Set message assertion
            (memberSaveRes.body.message).should.match('Please fill Member name');

            // Handle Member save error
            done(memberSaveErr);
          });
      });
  });

  it('should be able to update an Member if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Member
        agent.post('/api/members')
          .send(member)
          .expect(200)
          .end(function (memberSaveErr, memberSaveRes) {
            // Handle Member save error
            if (memberSaveErr) {
              return done(memberSaveErr);
            }

            // Update Member name
            member.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Member
            agent.put('/api/members/' + memberSaveRes.body._id)
              .send(member)
              .expect(200)
              .end(function (memberUpdateErr, memberUpdateRes) {
                // Handle Member update error
                if (memberUpdateErr) {
                  return done(memberUpdateErr);
                }

                // Set assertions
                (memberUpdateRes.body._id).should.equal(memberSaveRes.body._id);
                (memberUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Members if not signed in', function (done) {
    // Create new Member model instance
    var memberObj = new Member(member);

    // Save the member
    memberObj.save(function () {
      // Request Members
      request(app).get('/api/members')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Member if not signed in', function (done) {
    // Create new Member model instance
    var memberObj = new Member(member);

    // Save the Member
    memberObj.save(function () {
      request(app).get('/api/members/' + memberObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', member.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Member with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/members/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Member is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Member which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Member
    request(app).get('/api/members/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Member with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Member if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Member
        agent.post('/api/members')
          .send(member)
          .expect(200)
          .end(function (memberSaveErr, memberSaveRes) {
            // Handle Member save error
            if (memberSaveErr) {
              return done(memberSaveErr);
            }

            // Delete an existing Member
            agent.delete('/api/members/' + memberSaveRes.body._id)
              .send(member)
              .expect(200)
              .end(function (memberDeleteErr, memberDeleteRes) {
                // Handle member error error
                if (memberDeleteErr) {
                  return done(memberDeleteErr);
                }

                // Set assertions
                (memberDeleteRes.body._id).should.equal(memberSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Member if not signed in', function (done) {
    // Set Member user
    member.user = user;

    // Create new Member model instance
    var memberObj = new Member(member);

    // Save the Member
    memberObj.save(function () {
      // Try deleting Member
      request(app).delete('/api/members/' + memberObj._id)
        .expect(403)
        .end(function (memberDeleteErr, memberDeleteRes) {
          // Set message assertion
          (memberDeleteRes.body.message).should.match('User is not authorized');

          // Handle Member error error
          done(memberDeleteErr);
        });

    });
  });

  it('should be able to get a single Member that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Member
          agent.post('/api/members')
            .send(member)
            .expect(200)
            .end(function (memberSaveErr, memberSaveRes) {
              // Handle Member save error
              if (memberSaveErr) {
                return done(memberSaveErr);
              }

              // Set assertions on new Member
              (memberSaveRes.body.name).should.equal(member.name);
              should.exist(memberSaveRes.body.user);
              should.equal(memberSaveRes.body.user._id, orphanId);

              // force the Member to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Member
                    agent.get('/api/members/' + memberSaveRes.body._id)
                      .expect(200)
                      .end(function (memberInfoErr, memberInfoRes) {
                        // Handle Member error
                        if (memberInfoErr) {
                          return done(memberInfoErr);
                        }

                        // Set assertions
                        (memberInfoRes.body._id).should.equal(memberSaveRes.body._id);
                        (memberInfoRes.body.name).should.equal(member.name);
                        should.equal(memberInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Member.remove().exec(done);
    });
  });
});
