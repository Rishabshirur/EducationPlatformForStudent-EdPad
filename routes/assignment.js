import { Router } from "express";
const router = Router();
import path from "path";
import { ObjectId } from "mongodb";
import { assignmentFunc, submissionFunc } from "../data/index.js";
import { validWeblink } from "../helper.js";
import submission from "../data/submission.js";

const sid = "643895a8b3ee41b54432b778";

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const id = req.params.id;
      const assignmentDetail = await assignmentFunc.getAssignment(id);

      let faculty = false;
      // let submission = null;
      let submission = await submissionFunc.getSubmission(id, sid);
      // const role = req.session.role;
      // const userId = req.session.id;
      // if (role === "student") {
      //   faculty = false;
      // submission = await submissionFunc.getSubmission(id, userId);
      // }
      return res.render("assignment/assignmentDetail", {
        title: "Assignment Detail",
        assignment: assignmentDetail,
        faculty: faculty,
        submission: submission,
      });
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  })
  .delete(async (req, res) => {
    try {
      // const role = req.session.role;
      // if (role !== "faculty") {
      //   return res.redirect("/:id");
      // }
      const id = req.params.id;
      const courseId = (await assignmentFunc.getAssignment(id)).courseId;
      await assignmentFunc.removeAssignment(id);
      return res.redirect(`/course/${courseId}/assignment`);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

router.route("/:id/newSubmission").post(async (req, res) => {
  // const role = req.session.role;
  // if (role !== "student") {
  //   return res.redirect("/:id");
  // }
  // const studentId = req.session.id;
  const id = req.params.id;
  const submitFile = req.body.file.trim();
  const comment = req.body.comment.trim();
  if (!submitFile || !validWeblink(submitFile)) {
    return res.json({ error: "Not a valid file link" });
  }
  const submit = await submissionFunc.getSubmission(id, sid);
  if (submit === null) {
    var submission = await submissionFunc.createSubmission(
      id,
      // studentId,
      sid,
      submitFile,
      comment
    );
  } else {
    var submission = await submissionFunc.resubmitSubmission(
      id,
      // studentId,
      sid,
      submitFile,
      comment
    );
  }
  return res.json({ submission: submission });
});

router.route("/:id/allSubmission").get(async (req, res) => {
  const id = req.params.id;
  // const role = req.session.role;
  const role = "faculty";
  if (role !== "faculty") {
    return res.redirect(`/assignment/${id}`);
  }
  try {
    const submissionAll = await submissionFunc.getAllSubmission(id);
    const totalScore = submissionAll[0];
    const allSubmission = submissionAll[1];
    return res.render("submission/allSubmission", {
      assignmentId: id,
      totalScore: totalScore,
      allSubmission: allSubmission,
    });
  } catch (e) {
    return res.json({ error: e });
  }
});
export default router;
