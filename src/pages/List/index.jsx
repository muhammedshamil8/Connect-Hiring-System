import { useState } from "react";
import { Search, LeafyGreen, Loader } from 'lucide-react'
import Airtable from "airtable";
import backendUrl from "@/const/backendUrl";
import { useNavigate } from "react-router-dom";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useAuth } from '@/context/AuthContext';

const base = new Airtable({ apiKey: `${backendUrl.secretKey}` }).base(
  `${backendUrl.airtableBase}`
);

function index() {
  const [searchText, setSearchText] = useState("");
  const [studentID, setStudentID] = useState("");
  const [studentData, setStudentData] = useState({});
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState("chest");
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

  const authContext = useAuth();
  const { user, role: userRole, handleSignOut } = authContext || {};


  // toggle view cards
  const [view, setView] = useState({
    interview: true,
    selection: true,
    mainPoint: true,
    about: true
  });

  const toggleView = (key) => {
    setView((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const gradeMapping = {
    'O': 100,
    'A+': 90,
    'A': 85,
    'A-': 80,
    'B+': 75,
    'B': 70,
    'B-': 65,
    'C+': 60,
    'C': 55,
    'C-': 50,
    'D': 45,
    'F': 0,
    '': 0 // Handle empty string or no grade
  };


  const InterviewOverallGrade = (studentInfo) => {

    const grades = [
      studentInfo?.COMMUNICATION_GRADE,
      studentInfo?.ATITTUDE_GRADE,
      studentInfo?.DEDICATION_GRADE,
      studentInfo?.CONFIDENCE_GRADE,
      studentInfo?.COMMUNITY_KNOWLEDGE_GRADE,
    ];

    // Convert letter grades to numerical values
    const numericGrades = grades.map(grade => gradeMapping[grade] || 0);

    // Filter out null or undefined values (now just zeros for no grades)
    const validGrades = numericGrades.filter(grade => grade > 0);

    // Handle case where no valid grades
    if (validGrades.length === 0) return "No Grades Available";

    // Calculate the average
    const total = validGrades.reduce((acc, grade) => acc + grade, 0);
    const average = total / validGrades.length;

    // Map the average back to qualitative descriptions
    let qualitative;
    if (average >= 90) {
      qualitative = "Excellent";
    } else if (average >= 80) {
      qualitative = "Good";
    } else if (average >= 70) {
      qualitative = "Average";
    } else if (average >= 60) {
      qualitative = "Below Average";
    } else {
      qualitative = "Poor";
    }

    // Return total percentage out of 100 and qualitative description
    return {
      totalPercentage: average.toFixed(2), // Total percentage as a string with 2 decimal places
      qualitative: qualitative,
    };

  };

  const calculateOverallGrade = (studentInfo) => {
    const grades = [
      studentInfo?.FORM_GRADE,
      studentInfo?.INTERVIEW_OVERALL_GRADE,
      studentInfo?.COMMUNICATION_GRADE,
      studentInfo?.ATITTUDE_GRADE,
      studentInfo?.CAMP_GRADE_by_volunteer,
      studentInfo?.TASK_GRADE,
      studentInfo?.COMMUNITY_KNOWLEDGE_GRADE,
      studentInfo?.DEDICATION_GRADE,
      studentInfo?.CONFIDENCE_GRADE,
      studentInfo?.TASK_GRADE2,
      studentInfo?.PRESENTATION_GRADE_by_judge,
      studentInfo?.BONUS_GRADE,
      studentInfo.TaskInfo?.introduce ? 'A' : '',
    ];

    // Convert letter grades to numerical values
    const numericGrades = grades.map(grade => gradeMapping[grade] || 0);

    // Filter out null or undefined values (now just zeros for no grades)
    const validGrades = numericGrades.filter(grade => grade > 0);

    // Handle case where no valid grades
    if (validGrades.length === 0) return "No Grades Available";

    // Calculate the average
    const total = validGrades.reduce((acc, grade) => acc + grade, 0);
    const average = total / validGrades.length;

    // Map the average back to qualitative descriptions
    let qualitative;
    if (average >= 90) {
      qualitative = "Excellent";
    } else if (average >= 80) {
      qualitative = "Good";
    } else if (average >= 70) {
      qualitative = "Average";
    } else if (average >= 60) {
      qualitative = "Below Average";
    } else {
      qualitative = "Poor";
    }

    // Return total percentage out of 100 and qualitative description
    return {
      totalPercentage: average.toFixed(2), // Total percentage as a string with 2 decimal places
      qualitative: qualitative,
    };
  };



  const getStudent = async (search) => {
    if (searchText === "") return;
    // console.log(search, searchMode);
    clearStudentData();
    setInitial(false);
    setLoading(true);

    try {
      // Initialize variables for storing fetched data
      let formSubmittedRecords = [];
      let studentRecords = [];
      let taskRecords = [];

      // Fetch data from "interns_selection_2025"
      try {
        formSubmittedRecords = await base("interns_selection_2025")
          .select({
            view: "Applicants",
            filterByFormula: `${searchMode === 'chest' ? `{CHEST_NO} = '${search}'` : `{Admission_No} = '${search}'`}`,
            maxRecords: 1,
          })
          .firstPage();
      } catch (error) {
        // console.log("Error fetching interns_selection_2025:", error);
      }

      // Fetch data from "Scores"
      try {
        studentRecords = await base("Scores")
          .select({
            view: "Data",
            filterByFormula: `${searchMode === 'chest' ? `{CHEST_NO} = '${search}'` : `{Admission_No} = '${search}'`}`,
            maxRecords: 1,
          })
          .firstPage();
      } catch (error) {
        // console.log("Error fetching Scores:", error);
      }

      // Fetch data from "Task_Submit"
      try {
        taskRecords = await base("Task_Submit")
          .select({
            view: "Data",
            filterByFormula: `${searchMode === 'chest' ? `{CHEST_NO} = '${search}'` : `{Admission_No} = '${search}'`}`,
            maxRecords: 1,
          })
          .firstPage();
      } catch (error) {
        console.log("Error fetching Task_Submit:", error);
      }

      // Check if data is available
      if (formSubmittedRecords.length === 0 && studentRecords.length === 0 && taskRecords.length === 0) {
        setLoading(false);
        return;
      }

      let combinedData = {};
      // console.log(formSubmittedRecords, studentRecords, taskRecords);
      // Process data from "interns_selection_2025"
      if (formSubmittedRecords.length > 0) {
        const formRecord = formSubmittedRecords[0].fields;
        // console.log("Form_Submitted record:", formRecord);

        // const formResponses = Object.keys(formRecord)
        //   .filter((key) => !['CHEST_NO', 'Task Submit', 'Task_Submitted'].includes(key))
        //   .map((key) => ({
        //     question: key,
        //     answer: formRecord[key],
        //   }));

        const admissionNumber = formRecord['Admission_No'];
        const name = formRecord['Name']
        const department = formRecord['department']
        combinedData = {
          ...combinedData,
          formResponses: formRecord,
          admissionNumber,
          name,
          department
        };

        setStudentID(formSubmittedRecords[0].id);
      }

      // Process data from "Scores"
      if (studentRecords.length > 0) {
        const studentRecord = studentRecords[0].fields;
        // console.log("Students record:", studentRecord);

        combinedData = {
          ...combinedData,
          studentInfo: studentRecord,
        };

        setStudentID(studentRecords[0].id);
      }

      // Process data from "Task_Submit"
      if (taskRecords.length > 0) {
        const taskRecord = taskRecords[0].fields;
        // console.log("Task record:", taskRecord);

        combinedData = {
          ...combinedData,
          TaskInfo: taskRecord,
        };
      }

      // Calculate the overall grade
      combinedData.overallGrade = calculateOverallGrade(combinedData.studentInfo);
      combinedData.interviewOverallGrade = InterviewOverallGrade(combinedData.studentInfo);

      // Set the combined student data
      console.log(combinedData);
      setStudentData(combinedData);

      // console.log("Combined data:", combinedData);

    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
      setSearchText("");
    }
  };


  const clearStudentData = () => {
    // setSearchText("");
    setStudentData({});
    // setSubmitted(true);
  };

  // const handleNavigate = (path) => {
  //   navigate(path);
  // }

  return (
    <div className='w-full p-2'>
      <div className='flex items-center justify-center w-full mx-auto flex-col'>
        <div className="flex items-center justify-center gap-4  my-6 bg-gray-200 w-fit rounded-full">
          <div className={`flex items-center justify-center w-[150px] sm:w-[220px] h-12 rounded-full cursor-pointer ${searchMode === 'chest' ? 'primary-bg text-white' : 'bg-gray-200 text-black'}`} onClick={() => setSearchMode('chest')}>Chest No</div>
          <div className={`flex items-center justify-center w-[150px] sm:w-[220px] h-12 rounded-full cursor-pointer  ${searchMode === 'admission' ? 'primary-bg text-white' : 'bg-gray-200 text-black'}`} onClick={() => setSearchMode('admission')}>Admission No</div>
        </div>
        <div className='mx-auto p-[3px] flex items-center justify-center border border-gray-800 rounded-full w-fit overflow-hidden flex-grow max-w-[600px] '>

          <input type='search' placeholder='Search Chest Number' className='outline-none ring-0 border-none w-full p-2 px-4 '
            value={searchText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                getStudent(searchText);
              }
            }}
            onChange={(e) => {
              const uppercasedValue = e.target.value.toUpperCase();
              setSearchText(uppercasedValue);
            }} />
          <button className='primary-bg hover:bg-[#241E59]/70 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 cursor-pointer' onClick={() => {
            getStudent(searchText);
          }}>
            <Search size={16} /> Search
          </button>
        </div>

      </div >
      {
        loading ? (
          <div className='flex items-center justify-center w-full mt-8' >
            <h1 className='text-2xl font-semibold primary-text flex gap-2'>Loading...<Loader className="animate-spin" /></h1>
          </div>
        ) : (
          Object.keys(studentData).length > 0 && (
            <section className='mt-10'>

              <div className="h-32 my-6">
                <div className='flex flex-col w-full items-center justify-center gap-2 secondary-bg p-4 pb-0 absolute left-0 right-0 '>
                  <div className="flex items-center justify-center gap-4">
                    <div className='primary-bg  p-3 !text-white text-xl sm:text-2xl font-bold uppercase rounded-2xl'>{studentData.studentInfo?.CHEST_NO}</div>
                    <div className='flex flex-col items-center justify-center'>
                      <h1 className='text-xl sm:text-3xl font-semibold'>{studentData?.name}</h1>
                      <p className='-mt-0.5 text-sm sm:text-md'>{studentData?.department}</p>
                    </div>
                  </div>
                  <p className='-mt-0.5 text-sm sm:text-md pt-2 pb-1'>Admission no: {studentData.studentInfo?.Admission_No}</p>
                </div>
              </div>

              <div className='flex flex-col justify-center w-full items-center mt-10' ref={parent}>
                <div className="flex items-center justify-center w-full gap-2 mb-6">
                  <h1 className='primary-text underline underline-offset-2 text-xl sm:text-3xl font-semibold  select-none'>Main Point</h1>
                  <div className=''>
                    {<button className={`primary-text font-bold  px-4 py-1.5  rounded-2xl  select-none ${view.mainPoint ? '' : ''}`} onClick={() => toggleView('mainPoint')}>
                      {view.mainPoint ? 'Hide' : 'Show'}
                    </button>}
                  </div>
                </div>
                {view.mainPoint && (
                  <div className='w-full'>
                    <div className='primary-bg text-white font-bold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 select-none'>
                      <h1 className='col-span-2 text-left' >Program</h1>
                      <h1 className='col-span-1 text-center'>Grade</h1>
                      <h1 className='col-span-2 text-center'>Opinion</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Offilne Event</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.TaskInfo?.selection_camp ? <span className="bg-green-500 text-white px-2 md:px-4 py-1 rounded-lg">Present</span> : <span className="bg-red-500 text-white px-2 md:px-4 py-1 rounded-lg">Absent</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>Attendance</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Orientation Section</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.Orientation_Attendence ? <span className="bg-green-500 text-white px-2 md:px-4 py-1 rounded-lg">Present</span> : <span className="bg-red-500 text-white px-2 md:px-4 py-1 rounded-lg">Absent</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>Attendance</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Task</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'> {studentData.TaskInfo?.Task_Role ? <>Role: {studentData.TaskInfo?.Task_Role}</> : <span className="text-gray-500">N/A</span>}</h1>
                      <div className='col-span-2 text-center text-sm sm:text-md'>{studentData.TaskInfo?.Task_Link ? <span className="space-x-2">{studentData.TaskInfo?.extra_link ? <a target="_blank" href={studentData.TaskInfo?.extra_link} className="rounded-md px-4 text-white py-1 bg-orange-500">Extra</a> : ''}<a target="_blank" href={studentData.TaskInfo?.Task_Link} className="rounded-md px-4 text-white py-1 bg-orange-500">Open</a></span> : <span className="text-gray-500"> N/A</span>}</div>
                    </div>

                    <div className='bg-[#241E59]/40 text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mt-4 mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Selection Result</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.SELECTION_RESULT ? studentData.studentInfo?.SELECTION_RESULT : <span className="text-gray-700">...</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{'Final opinion'}</h1>
                    </div>
                  </div>
                )}
              </div>

              <div className='flex flex-col justify-center w-full items-center mt-10' ref={parent}>
                <div className="flex items-center justify-center w-full gap-2 mb-6">
                  <h1 className='primary-text underline underline-offset-2 text-xl sm:text-3xl font-semibold select-none'>Interview</h1>
                  <div className=''>
                    {<button className={`primary-text font-bold  px-4 py-1.5  rounded-2xl  select-none ${view.interview ? '' : ''}`} onClick={() => toggleView('interview')}>
                      {view.interview ? 'Hide' : 'Show'}
                    </button>}
                  </div>
                </div>
                {view.interview && (
                  <div className='w-full'>
                    <div className='primary-bg text-white font-bold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 select-none'>
                      <h1 className='col-span-2 text-left' >Program</h1>
                      <h1 className='col-span-1 text-center'>Grade</h1>
                      <h1 className='col-span-2 text-center'>Opinion</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Communication Skill</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.COMMUNICATION_GRADE ? studentData.studentInfo?.COMMUNICATION_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.COMMUNICATION_GRADE ? studentData.studentInfo?.COMMUNICATION_GRADE : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Dedication</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.DEDICATION_GRADE ? studentData.studentInfo?.DEDICATION_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.DEDICATION_GRADE ? studentData.studentInfo?.DEDICATION_GRADE : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Attitude</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.ATITTUDE_GRADE ? studentData.studentInfo?.ATITTUDE_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.ATITTUDE_GRADE ? studentData.studentInfo?.ATITTUDE_GRADE : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Confidence</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.CONFIDENCE_GRADE ? studentData.studentInfo?.CONFIDENCE_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.CONFIDENCE_GRADE ? studentData.studentInfo?.CONFIDENCE_GRADE : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Community knowledge </h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.COMMUNITY_KNOWLEDGE_GRADE ? studentData.studentInfo?.COMMUNITY_KNOWLEDGE_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.COMMUNITY_KNOWLEDGE_GRADE ? studentData.studentInfo?.COMMUNITY_KNOWLEDGE_GRADE : <span className="text-gray-500">None</span>}</h1>
                    </div>

                    <div className='bg-[#241E59]/40 text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mt-4 mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left' >Interview Overall</h1>
                      <h1 className='col-span-1 text-center'>{studentData.interviewOverallGrade ? studentData.interviewOverallGrade.totalPercentage + '%' : <span className="text-gray-700">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center'>{studentData.studentInfo?.INTERVIEW_OVERALL_OPINION ? studentData.studentInfo?.INTERVIEW_OVERALL_OPINION : <span className="text-gray-500">{studentData.interviewOverallGrade.qualitative}</span>}</h1>
                    </div>
                  </div>
                )}
              </div>
              <div className='flex flex-col justify-center w-full items-center mt-10' ref={parent}>
                <div className="flex items-center justify-center w-full gap-2 mb-6">
                  <h1 className='primary-text underline underline-offset-2 text-xl sm:text-3xl font-semibold  select-none'>Scores</h1>
                  <div className=''>
                    {<button className={`primary-text font-bold  px-4 py-1.5  rounded-2xl  select-none ${view.selection ? '' : ''}`} onClick={() => toggleView('selection')}>
                      {view.selection ? 'Hide' : 'Show'}
                    </button>}
                  </div>
                </div>
                {view.selection && (
                  <div className='w-full'>
                    <div className='primary-bg text-white font-bold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 select-none'>
                      <h1 className='col-span-2 text-left' >Program</h1>
                      <h1 className='col-span-1 text-center'>Grade</h1>
                      <h1 className='col-span-2 text-center'>Opinion</h1>
                    </div>

                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Camp</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.CAMP_GRADE_by_volunteer ? studentData.studentInfo?.CAMP_GRADE_by_volunteer : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'><span className="text-gray-500">by Volunteer</span></h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Camp</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.PRESENTATION_GRADE_by_judge ? studentData.studentInfo?.PRESENTATION_GRADE_by_judge : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'><span className="text-gray-500"> by Judge</span></h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Online Task</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.TASK_GRADE ? studentData.studentInfo?.TASK_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.TASK_OPINION ? studentData.studentInfo?.TASK_OPINION : <span className="text-gray-500">None</span>}</h1>
                    </div>

                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Bonus Points</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.TaskInfo?.introduce ? <span className="bg-green-500 text-white px-2 md:px-4 py-1 rounded-lg">Done</span> : <span className="bg-red-100 text-white px-2 md:px-4 py-1 rounded-lg">Nop</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.BONUS_OPINION ? studentData.studentInfo?.BONUS_OPINION : <span className="text-gray-500">introduce on camp</span>}</h1>
                    </div>

                    <div className='bg-[#241E59]/40 text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mt-4 mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Overall</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.overallGrade ? studentData.overallGrade.totalPercentage + '%' : <span className="text-gray-700">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.overallGrade ? studentData.overallGrade.qualitative : <span className="text-gray-700">None</span>}</h1>
                    </div>

                  </div>
                )}
              </div>

              <div className='flex flex-col justify-center w-full items-center mt-10' ref={parent}>
                <div className="flex items-center justify-center w-full gap-2 mb-6">
                  <h1 className='primary-text underline underline-offset-2 text-xl sm:text-3xl font-semibold  select-none'>About (Form Response)</h1>
                  <div className=''>
                    {<button className={`primary-text font-bold  px-4 py-1.5  rounded-2xl  select-none ${view.about ? '' : ''}`} onClick={() => toggleView('about')}>
                      {view.about ? 'Hide' : 'Show'}
                    </button>}
                  </div>
                </div>
                {view.about && (
                  <div className='w-full'>
                    {studentData.formResponses ? (
                      <>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            email
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.email}</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Phone number
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.Phone_number}</h1>
                        </div>
                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Department
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.department}</h1>
                        </div>
                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Year
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.year} Year</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            How did you hear about Connect?
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.how_did_you_hear}</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Preferred role in Connect
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.preferred_role}</h1>
                        </div>
                        {studentData.formResponses?.preferred_role === 'Other' && (
                          <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                            <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                              Please specify your preferred role
                              <span className="block md:hidden"> :-</span></h1>
                            <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.custom_role}</h1>
                          </div>)}

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Tell us something interesting about yourself
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.interesting_fact}</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            What are your expectations from Connect?
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.expectations}</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Why do you want to be a part of this community?
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.reason}</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            What is your hobby?
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.hobby}</h1>
                        </div>

                        <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                          <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >
                            Are you part of any other community, club, or organization?
                            <span className="block md:hidden"> :-</span></h1>
                          <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{studentData.formResponses?.other_communities}</h1>
                        </div>
                      </>

                    ) : (
                      <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                        <h1 className='col-span-5 text-center text-sm sm:text-md'>No Form Response Data Found</h1>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </section>
          )
        )
      }

      {
        !loading && initial && (
          <div className="flex items-center justify-center w-full mt-14">
            <div className="text-center select-none">
              <h1 className="text-2xl font-semibold primary-text mb-2 mx-auto flex items-center justify-center"><LeafyGreen size={36} /></h1>
              <p className="text-lg text-gray-600">Everything is set! You can start your search.</p>
            </div>
          </div>
        )
      }

      {
        !loading && !initial && Object.keys(studentData).length === 0 && (
          <div className="flex items-center justify-center w-full mt-8 select-none">
            <div className="text-center">
              <h1 className="text-xl  sm:text-2xl font-semibold primary-text mb-2">No Data Found</h1>
              <p className="text-md sm:text-lg text-gray-600">Please check the Chest No and try again.</p>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default index  
