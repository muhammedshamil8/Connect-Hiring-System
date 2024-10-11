import {
  Button, Input, Card, CardBody, Typography, Textarea, Select, Option, Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Checkbox
} from "@material-tailwind/react";
import Airtable from "airtable";
import backendUrl from "@/const/backendUrl";
import { useState } from "react";
import { Search, ChefHat, Loader } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/AuthContext';

const base = new Airtable({ apiKey: `${backendUrl.secretKey}` }).base(
  `${backendUrl.airtableBase}`
);

const gradePoints = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  D: 4,
  'N/A': 0
};

const pointToGrade = {
  10: 'O',
  9: 'A+',
  8: 'A',
  7: 'B+',
  6: 'B',
  5: 'C',
  4: 'D',
  3: 'E',
  0: ''
};

function App() {
  const [searchText, setSearchText] = useState("");
  const [studentID, setStudentID] = useState("");
  const [studentData, setStudentData] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [initial, setInitial] = useState(true);
  const [open, setOpen] = useState(false);
  const [admissionNo, setAdmissionNo] = useState("");
  const [error, setError] = useState("");

  const authContext = useAuth();
  const { user, role: userRole, handleSignOut } = authContext || {};

  // Score states
  const [grades, setGrades] = useState({
    COMMUNICATION: '',
    DEDICATION: '',
    SKILL_ACHIEVEMENT: '',
    SKILL_ACHIEVEMENT_TEXT: '',
    INTERVIEW_OVERALL_OPINION: '',
    INTERVIEW_OVERALL_GRADE: '',
    DEBATE_SCORE: '',
    DEBATE_OPINION: '',
    GROUP_SCORE: '',
    GROUP_OPINION: '',
    STAGE_GROUP_GRADE: '',
    STAGE_GROUP_OPINION: '',
    STAGE_SCORE: '',
    STAGE_OPINION: '',
    OVERALL_OPINION: '',
    OVERALL_GRADE: '',
    ORIENTATION_ATTENDED: false,
    SELECTION_CAMP_ATTENDED: false,
    BONUS_GRADE: '',
    BONUS_OPINION: '',
    FUND_COLLECTED: '',
    SELECTION_RESULT: '...',
  });

  const getStudent = async (search) => {
    if (searchText === "") return;
    setAdmissionNo(search);
    setInitial(false);
    clearStudentData();
    setAlert(false);
    setSubmitted(false);
    setLoading(true);
    base("Students")
      .select({
        view: "Data",
        filterByFormula: `({CHEST_NO} = '${search}')`,
      })
      .eachPage(
        (record, fetchNextPage) => {
          if (record.length === 0) {
            setAlert(true);
            setLoading(false);
            return;
          }
          setStudentData(record[0].fields);
          setGrades({
            COMMUNICATION: record[0].fields.COMMUNICATION_GRADE || '',
            DEDICATION: record[0].fields.DEDICATION_GRADE || '',
            SKILL_ACHIEVEMENT: record[0].fields.SKILL_ACHIEVEMENT_GRADE || '',
            SKILL_ACHIEVEMENT_TEXT: record[0].fields.SKILL_ACHIEVEMENT_TEXT || '',
            INTERVIEW_OVERALL_OPINION: record[0].fields.INTERVIEW_OVERALL_OPINION || '',
            INTERVIEW_OVERALL_GRADE: record[0].fields.INTERVIEW_OVERALL_GRADE || '',
            DEBATE_SCORE: record[0].fields.DEBATE_GRADE || '',
            DEBATE_OPINION: record[0].fields.DEBATE_OPINION || '',
            GROUP_SCORE: record[0].fields.GROUP_GRADE || '',
            GROUP_OPINION: record[0].fields.GROUP_OPINION || '',
            STAGE_GROUP_GRADE: record[0].fields.STAGE_GROUP_GRADE || '',
            STAGE_GROUP_OPINION: record[0].fields.STAGE_GROUP_OPINION || '',
            STAGE_SCORE: record[0].fields.STAGE_GRADE || '',
            STAGE_OPINION: record[0].fields.STAGE_OPINION || '',
            OVERALL_GRADE: record[0].fields.OVERALL_GRADE || '',
            OVERALL_OPINION: record[0].fields.OVERALL_OPINION || '',
            ORIENTATION_ATTENDED: record[0].fields.ORIENTATION_ATTENDED || false,
            SELECTION_CAMP_ATTENDED: record[0].fields.SELECTION_CAMP_ATTENDED || false,
            BONUS_GRADE: record[0].fields.BONUS_GRADE || '',
            BONUS_OPINION: record[0].fields.BONUS_OPINION || '',
            FUND_COLLECTED: record[0].fields.FUND_COLLECTED || '',
            SELECTION_RESULT: record[0].fields.SELECTION_RESULT || '...',
          });
          setStudentID(record[0].id);
          fetchNextPage();
          setLoading(false);
        },
        function done(err) {
          if (err) {
            console.error(err);
            toast.error(err, {
              position: 'top-center',
            });
            setLoading(false);
            return;
          }
        }
      );
  };

  const clearStudentData = () => {
    // setSearchText("");
    setStudentData({});
    setGrades({
      COMMUNICATION: '',
      DEDICATION: '',
      SKILL_ACHIEVEMENT: '',
      SKILL_ACHIEVEMENT_TEXT: '',
      INTERVIEW_OVERALL_OPINION: '',
      INTERVIEW_OVERALL_GRADE: '',
      DEBATE_SCORE: '',
      DEBATE_OPINION: '',
      GROUP_SCORE: '',
      GROUP_OPINION: '',
      STAGE_GROUP_GRADE: '',
      STAGE_GROUP_OPINION: '',
      STAGE_SCORE: '',
      STAGE_OPINION: '',
      OVERALL_GRADE: '',
      OVERALL_OPINION: '',
      ORIENTATION_ATTENDED: false,
      SELECTION_CAMP_ATTENDED: false,
      BONUS_GRADE: '',
      BONUS_OPINION: '',
      FUND_COLLECTED: '',
      SELECTION_RESULT: '',
    });
    setSubmitted(true);
  };

  const submitScores = async () => {
    base("Students").update(
      `${studentID}`,
      {
        COMMUNICATION_GRADE: grades.COMMUNICATION === 'N/A' ? '' : grades.COMMUNICATION,
        DEDICATION_GRADE: grades.DEDICATION === 'N/A' ? '' : grades.DEDICATION,
        SKILL_ACHIEVEMENT_GRADE: grades.SKILL_ACHIEVEMENT === 'N/A' ? '' : grades.SKILL_ACHIEVEMENT,
        SKILL_ACHIEVEMENTS: grades.SKILL_ACHIEVEMENT_TEXT || '',
        INTERVIEW_OVERALL_OPINION: grades.INTERVIEW_OVERALL_OPINION || '',
        INTERVIEW_OVERALL_GRADE: grades.INTERVIEW_OVERALL_GRADE || '',
        DEBATE_GRADE: grades.DEBATE_SCORE === 'N/A' ? '' : grades.DEBATE_SCORE,
        DEBATE_OPINION: grades.DEBATE_OPINION || '',
        GROUP_GRADE: grades.GROUP_SCORE === 'N/A' ? '' : grades.GROUP_SCORE,
        GROUP_OPINION: grades.GROUP_OPINION || '',
        STAGE_GROUP_GRADE: grades.STAGE_GROUP_GRADE === 'N/A' ? '' : grades.STAGE_GROUP_GRADE,
        STAGE_GROUP_OPINION: grades.STAGE_GROUP_OPINION || '',
        STAGE_GRADE: grades.STAGE_SCORE === 'N/A' ? '' : grades.STAGE_SCORE,
        STAGE_OPINION: grades.STAGE_OPINION || '',
        OVERALL_OPINION: grades.OVERALL_OPINION || '',
        OVERALL_GRADE: grades.OVERALL_GRADE || '',
        ORIENTATION_ATTENDED: grades.ORIENTATION_ATTENDED || false,
        SELECTION_CAMP_ATTENDED: grades.SELECTION_CAMP_ATTENDED || false,
        BONUS_GRADE: grades.BONUS_GRADE === 'N/A' ? '' : grades.BONUS_GRADE,
        BONUS_OPINION: grades.BONUS_OPINION || '',
        FUND_COLLECTED: grades.FUND_COLLECTED || '',
        SELECTION_RESULT: grades.SELECTION_RESULT || '',
      },
      function (err) {
        if (err) {
          console.error(err);
          toast.error(err, {
            position: 'top-center',
          });
          return;
        } else {
          // handleOpen();
          toast.success(`Score Added to the Student ${admissionNo}`, {
            position: 'top-center',
          });
          setAdmissionNo("");
          setInitial(true);
          clearStudentData();
        }
      }
    );
  };

  const handleGradeChange = (section, value) => {
    const updatedGrades = {
      ...grades,
      [section]: value
    };

    // Calculate INTERVIEW_OVERALL_GRADE
    const communicationGrade = gradePoints[updatedGrades.COMMUNICATION] || 0;
    const dedicationGrade = gradePoints[updatedGrades.DEDICATION] || 0;
    const skillAchievementGrade = gradePoints[updatedGrades.SKILL_ACHIEVEMENT] || 0;

    const interviewOverallGrade = (communicationGrade + dedicationGrade + skillAchievementGrade) / 3;
    updatedGrades.INTERVIEW_OVERALL_GRADE = pointToGrade[Math.round(interviewOverallGrade)] || '...';

    console.log(updatedGrades);
    // Calculate OVERALL_GRADE
    const debateScore = gradePoints[updatedGrades.DEBATE_SCORE] || 0;
    const groupScore = gradePoints[updatedGrades.GROUP_SCORE] || 0;
    const groupStageScore = gradePoints[updatedGrades.STAGE_GROUP_GRADE] || 0;
    const stageScore = gradePoints[updatedGrades.STAGE_SCORE] || 0;
    const bonusScore = gradePoints[updatedGrades.BONUS_GRADE] || 0;


    const overallGrade = (debateScore + groupScore + stageScore + groupStageScore + bonusScore) / 5;
    updatedGrades.OVERALL_GRADE = pointToGrade[Math.round(overallGrade)] || '...';

    setGrades(updatedGrades);
  };

  const handleOpen = () => setOpen(!open);

  return (
    <>
      {userRole === 'admin' ? (
        <div className="flex flex-col items-center px-4 p-2">
          <h2 className="text-2xl font-semibold primary-text">This page is on work</h2>
          {/* <div className='flex items-center justify-center w-full mx-auto'>
            <div className='mx-auto p-[3px] flex items-center justify-center border border-gray-800 rounded-full w-fit overflow-hidden flex-grow max-w-[600px] '>
              <input type='search' placeholder='Search Chest Number' className='outline-none ring-0 border-none w-full p-2 px-4 '
                onChange={(e) => setSearchText(e.target.value.toUpperCase())}
                value={searchText}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    getStudent(searchText);
                  }
                }}
              />
              <button className='primary-bg hover:bg-[#241E59]/70 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 cursor-pointer' onClick={() => getStudent(searchText)}>
                <Search size={16} /> Search
              </button>
            </div>
          </div>
          {!loading && studentData && Object.keys(studentData).length > 0 && (
            <Card className="mt-6 w-full">
              <CardBody>

                <div className='flex w-full items-center justify-center gap-4 secondary-bg p-4 mb-4 rounded-md'>
                  <div className='primary-bg  p-3 !text-white text-xl sm:text-3xl font-bold uppercase rounded-2xl'>{studentData.CHEST_NO}</div>
                  <div className='flex flex-col items-center justify-center'>
                    <h1 className='text-xl sm:text-3xl font-semibold text-black'>{studentData.NAME}</h1>
                    <p className='-mt-0.5 text-sm sm:text-md text-black'>{studentData.DEPARTMENT}</p>
                  </div>
                </div>


                <Typography variant="h5" className="mb-3" color="blue-gray">
                  Interview
                </Typography>
                <div className="flex gap-2 flex-col mb-4 space-y-3">
                  <Select
                    label="Communication Skill"
                    value={grades.COMMUNICATION}
                    onChange={(value) => handleGradeChange("COMMUNICATION", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Select
                    label="Dedication"
                    value={grades.DEDICATION}
                    onChange={(value) => handleGradeChange("DEDICATION", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Select
                    label="Skill & Achievement"
                    value={grades.SKILL_ACHIEVEMENT_TEXT}
                    onChange={(value) => handleGradeChange("SKILL_ACHIEVEMENT", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Textarea
                    label="Skill Achievements"
                    value={grades.SKILL_ACHIEVEMENT_TEXT}
                    onChange={(e) => setGrades({ ...grades, SKILL_ACHIEVEMENT_TEXT: e.target.value })}
                  />
                  <div className="flex items-center w-full">
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-bold mb-1">Overall Interview Opinion:</span>
                      <Textarea
                        label="Opinion"
                        value={grades.INTERVIEW_OVERALL_OPINION}
                        onChange={(e) => setGrades({ ...grades, INTERVIEW_OVERALL_OPINION: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="!text-gray-800 md:px-6 flex items-center justify-between border border-gray-400 bg-[#241E59]/40 p-2 rounded-lg">
                    <Typography variant="h6">Interview Overall Grade: {grades.INTERVIEW_OVERALL_GRADE}</Typography>
                  </div>
                </div>
                <Typography variant="h5" className="mb-3" color="blue-gray">
                  Selection
                </Typography>
                <div className="flex gap-4 flex-col">
                  <Select
                    label="Debate Score"
                    value={grades.DEBATE_SCORE}
                    onChange={(value) => handleGradeChange("DEBATE_SCORE", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Textarea
                    label="Debate Opinion"
                    value={grades.DEBATE_OPINION}
                    onChange={(e) => setGrades({ ...grades, DEBATE_OPINION: e.target.value })}
                  />
                  <Select
                    label="Group Activity Score"
                    value={grades.GROUP_SCORE}
                    onChange={(value) => handleGradeChange("GROUP_SCORE", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Textarea
                    label="Group Opinion"
                    value={grades.GROUP_OPINION}
                    onChange={(e) => setGrades({ ...grades, GROUP_OPINION: e.target.value })}
                  />
                  <Select
                    label="Stage Group Activity Score"
                    value={grades.STAGE_GROUP_GRADE}
                    onChange={(value) => handleGradeChange("STAGE_GROUP_GRADE", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Textarea
                    label="Stage Group Opinion"
                    value={grades.STAGE_GROUP_OPINION}
                    onChange={(e) => setGrades({ ...grades, STAGE_GROUP_OPINION: e.target.value })}
                  />
                  <Select
                    label="Stage Performance Score"
                    value={grades.STAGE_SCORE}
                    onChange={(value) => handleGradeChange("STAGE_SCORE", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Textarea
                    label="Stage Opinion"
                    value={grades.STAGE_OPINION}
                    onChange={(e) => setGrades({ ...grades, BONUS_GRADE: e.target.value })}
                  />
                  <Select
                    label="Bonus Score"
                    value={grades.BONUS_GRADE}
                    onChange={(value) => handleGradeChange("BONUS_GRADE", value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <Option key={grade} value={grade}>{grade}</Option>
                    ))}
                  </Select>
                  <Textarea
                    label="Bonus Opinion"
                    value={grades.BONUS_OPINION}
                    onChange={(e) => setGrades({ ...grades, BONUS_OPINION: e.target.value })}
                  />
                  <div className="flex items-center w-full">
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-bold mb-1">Overall  Opinion:</span>
                      <Textarea
                        label="Opinion"
                        value={grades.OVERALL_OPINION}
                        onChange={(e) => setGrades({ ...grades, OVERALL_OPINION: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="!text-gray-800 md:px-6 flex items-center justify-between border border-gray-400 bg-[#241E59]/40 p-2 rounded-lg">
                    <Typography variant="h6"> Overall Grade: {grades.OVERALL_GRADE}</Typography>
                  </div>

                  <Typography variant="h5" className="mt-3" color="blue-gray">
                    Attendance
                  </Typography>
                  <div className="flex items-center gap-4 flex-col md:flex-row w-full">
                    <div className="flex justify-start items-start gap-2 w-full">
                      <Checkbox
                        id="orientation"
                        name="orientation"
                        checked={grades.ORIENTATION_ATTENDED}
                        onChange={(e) => setGrades({ ...grades, ORIENTATION_ATTENDED: e.target.checked })}
                        label="Orientation Attended"
                      />
                    </div>
                    <div className="flex items-start justify-start gap-2 w-full">
                      <Checkbox
                        id="selection"
                        name="selection"
                        checked={grades.SELECTION_CAMP_ATTENDED}
                        onChange={(e) => setGrades({ ...grades, SELECTION_CAMP_ATTENDED: e.target.checked })}
                        label="Selection Camp Attended"
                      />
                    </div>
                  </div>

                  <Typography variant="h5" className="mb-3" color="blue-gray">
                    Main Points
                  </Typography>
                  <Input
                    type="number"
                    label="Fund Collected"
                    value={grades.FUND_COLLECTED}
                    onChange={(e) => setGrades({ ...grades, FUND_COLLECTED: e.target.value })}
                  />
                  <Select
                    label="Selection Result"
                    required
                    value={grades.SELECTION_RESULT}
                    onChange={(value) => setGrades({ ...grades, SELECTION_RESULT: value })}
                  >
                    <Option value="...">...</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>

                  </Select>
                  <Button
                    className="w-full bg-green-500 mt-2"
                    onClick={submitScores}
                  >
                    Submit
                  </Button>
                </div>
              </CardBody>
            </Card>
          )
          }

          {loading && (
            <div className='flex items-center justify-center w-full mt-8'>
              <h1 className='text-2xl font-semibold primary-text flex gap-2 '>Loading...<Loader className="animate-spin" /></h1>
            </div>
          )}

          {!loading && initial && (
            <div className="flex items-center justify-center w-full mt-14">
              <div className="text-center">
                <h1 className="text-2xl font-semibold primary-text mb-2 mx-auto flex items-center justify-center"><ChefHat size={40} /></h1>
                <p className="text-lg text-gray-600">Everything is set! You can start your search.</p>
              </div>
            </div>
          )}

          {alert && <div className="text-red-500 mt-4">No student found!</div>} */}
          <ToastContainer />
        </div >
      ) : (
        <div className="flex items-center justify-center w-full h-full mt-8">
          <h2 className="text-2xl font-semibold primary-text">You are not authorized to view this page</h2>
        </div>
      )}
    </>

  );
}

export default App;
