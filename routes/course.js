import { Router } from "express";
const router = Router();
import path from "path";
import { assignmentFunc } from "../data/index.js";
import { validStr, validWeblink, nonNegInt, validDueTime } from "../helper.js";
import { coursesFunc } from "../data/index.js";


router
  .route('/admin')
  .get(async (req, res) => {
    //code here for GET
    try {
      const allCourses = await coursesFunc.getAll()
      let coursesList = [];
      let coursesObj = {};
      for (let i of allCourses) {
        i._id = i._id.toString();
        coursesObj = {
          // "_id": i._id,
          // "name": i.name, 
          "courseTitle": i.courseTitle,
          "courseId": i.courseId,
          "description": i.description,
          "professorId": i.professorId,
          "professorName": i.professorName,
        };

        coursesList.push(coursesObj);
      }


      return res.render("courses/courses", {
        title: "All courses",
        allCourses: coursesList
      })
    } catch (e) {
      res.status(500).json({ error: e });
    }
  })



router.get("/", async (req, res) => {

  try {
    console.log(req.session.user.emailAddress)
    console.log(req.session.user.role)
    if (req.session.user) {
      if (req.session.user.role === 'admin') {

        return res.redirect('/admin');
      } else if (req.session.user.role === 'student') {

        let getStudCourses = await coursesFunc.getCourseByStudentEmail(req.session.user.emailAddress);
        return res.render("courses/courses", {
          title: "Student courses",
          allCourses: getStudCourses
        })

      } else if (req.session.user.role === 'faculty') {
        let getFacultyCourses = await coursesFunc.getCourseByFacultyEmail(req.session.user.emailAddress);
        return res.render("courses/courses", {
          title: "Faculty teaching courses",
          allCourses: getFacultyCourses
        })
      }
    } else {
      res.redirect('/login');

    }



    // if no role
    // let getStudCourses = await coursesFunc.getCourseByCWID(id_got);
    // return res.render("courses/courses", {
    //   title: "Student courses",
    //   allCourses: getStudCourses
    // })


  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

router.get("/:id", async (req, res) => {
  let id_got = req.params.id
  id_got = id_got.trim()

  try {
    console.log("haha")
    let course_got = await coursesFunc.getCourseByObjectID(id_got)
    console.log(course_got)
    return res.render("courses/coursedetail", {
      title: "Course Detail",
      courseObjectID: course_got._id,
      courseTitle: course_got.courseTitle
    })
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});





router.get("/:id/assignment", async (req, res) => {
  try {
    const courseId = req.params.id;
    const assignmentList = await assignmentFunc.getAllAssignment(courseId);
    // const role = req.session.role;
    let faculty = true;
    // if (role === "faculty") {
    //   faculty = true;
    // }
    return res.render("assignment/assignment", {
      title: "All Assignment",
      courseId: courseId,
      assignmentList: assignmentList,
      faculty: faculty,
    });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

router
  .route("/:id/newAssignment")
  .get(async (req, res) => {
    try {
      //   if (req.session.role !== "faculty") {
      //     return res.redirect(`/course/${id}/assignment`);
      //   }
      const id = req.params.id;
      return res.render("assignment/newAssignment", { courseId: id });
    } catch (e) {
      return res.json({ error: e });
    }
  })
  .post(async (req, res) => {
    //   if (req.session.role !== "faculty") {
    //     return res.redirect(`/course/${id}/assignment`);
    //   }
    const courseId = req.params.id;
    const title = req.body.title.trim();
    const dueDate = req.body.dueDate.trim();
    const dueTime = req.body.dueTime.trim();
    const content = req.body.content.trim();
    const file = req.body.file.trim();
    const score = req.body.score.trim();

    if (
      !validStr(title) ||
      !validStr(dueDate) ||
      !validStr(dueTime) ||
      (!validStr(content) && !validWeblink(file)) ||
      !nonNegInt(score) ||
      !validDueTime(dueDate, dueTime)
    ) {
      return res.json({ error: "Invalid Input" });
    }

    try {
      await assignmentFunc.createAssignment(
        title,
        courseId,
        dueDate,
        dueTime,
        content,
        file,
        score
      );
      return res.redirect(`/course/${courseId}/assignment`);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

export default router;
