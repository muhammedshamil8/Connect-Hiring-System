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

  const getStudent = async (search) => {
    if (searchText === "") return;
    console.log(search, searchMode);
    clearStudentData();
    setInitial(false);
    setLoading(true);

    try {
      // Fetch from both "Form_Submitted" and "Students" tables in parallel
      const [formSubmittedRecords, studentRecords] = await Promise.all([
        base("Form_Submitted")
          .select({
            view: "applicant",
            filterByFormula: `${searchMode === 'chest' ? `{CHEST_NO} = '${search}'` : `{ADMISSION_NUMBER} = '${search}'`}`,
            maxRecords: 1,  // Limit to a single record
          })
          .firstPage(),

        base("Students")
          .select({
            view: "Data",
            filterByFormula: `${searchMode === 'chest' ? `{CHEST_NO} = '${search}'` : `{ADMISSION_NUMBER} = '${search}'`}`,
            maxRecords: 1,  // Limit to a single record
          })
          .firstPage()
      ]);

      if (formSubmittedRecords.length === 0 && studentRecords.length === 0) {
        setLoading(false);
        return;
      }

      let combinedData = {};

      // Process data from "Form_Submitted"
      if (formSubmittedRecords.length > 0) {
        const formRecord = formSubmittedRecords[0].fields;
        console.log("Form_Submitted record:", formRecord);

        // want to hide
        const formResponses = Object.keys(formRecord)
          .filter((key) => !['CHEST_NO', 'Students', 'Timestamp'].includes(key))
          .map((key) => ({
            question: key,
            answer: formRecord[key],
          }));

        // Store ADMISSION_NUMBER from formResponses
        const admissionNumber = formRecord['ADMISSION_NUMBER'];

        combinedData = {
          ...combinedData,
          formResponses,
          admissionNumber,
        };

        setStudentID(formSubmittedRecords[0].id);
      }

      // Process data from "Students"
      if (studentRecords.length > 0) {
        const studentRecord = studentRecords[0].fields;
        console.log("Students record:", studentRecord);

        combinedData = {
          ...combinedData,
          studentInfo: studentRecord,  // Store student info directly
        };

        setStudentID(studentRecords[0].id);  // Update student ID if necessary
      }

      // Set the combined student data
      setStudentData(combinedData);
      console.log("Combined data:", combinedData);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
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
                      <h1 className='text-xl sm:text-3xl font-semibold'>{studentData?.studentInfo?.NAME}</h1>
                      <p className='-mt-0.5 text-sm sm:text-md'>{studentData.studentInfo?.DEPARTMENT}</p>
                    </div>
                  </div>
                  <p className='-mt-0.5 text-sm sm:text-md pt-2 pb-1'>Admission no: {studentData.admissionNumber}</p>
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
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Selection camp</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.SELECTION_CAMP_ATTENDED ? <span className="bg-green-500 text-white px-2 md:px-4 py-1 rounded-lg">Present</span> : <span className="bg-red-500 text-white px-2 md:px-4 py-1 rounded-lg">Absent</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>Attendance</h1>
                    </div>
                    {/* <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                    <h1 className='col-span-2 text-left text-sm sm:text-md' >Orientation Class</h1>
                    <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.ORIENTATION_ATTENDED ? 'Present' : 'Absent'}</h1>
                    <h1 className='col-span-2 text-center text-sm sm:text-md'>Attendance</h1>
                  </div> */}
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Fund Collected</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>₹{studentData.studentInfo?.FUND_COLLECTED ? studentData.studentInfo?.FUND_COLLECTED : <span className="text-gray-500"> N/A</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{'Collected Amount'}</h1>
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
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Skill & Achievements</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.SKILL_ACHIEVEMENT_GRADE ? studentData.studentInfo?.SKILL_ACHIEVEMENT_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.SKILL_ACHIEVEMENTS ? studentData.studentInfo?.SKILL_ACHIEVEMENTS : <span className="text-gray-500">None</span>}</h1>
                    </div>

                    <div className='bg-[#241E59]/40 text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mt-4 mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left' >Overall</h1>
                      <h1 className='col-span-1 text-center'>{studentData.studentInfo?.INTERVIEW_OVERALL_GRADE ? studentData.studentInfo?.INTERVIEW_OVERALL_GRADE : <span className="text-gray-700">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center'>{studentData.studentInfo?.DEDICATION_GRADE ? studentData.studentInfo?.DEDICATION_GRADE : <span className="text-gray-700">None</span>}</h1>
                    </div>
                  </div>
                )}
              </div>

              <div className='flex flex-col justify-center w-full items-center mt-10' ref={parent}>
                <div className="flex items-center justify-center w-full gap-2 mb-6">
                  <h1 className='primary-text underline underline-offset-2 text-xl sm:text-3xl font-semibold  select-none'>Selection Camp</h1>
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
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Debate</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.DEBATE_GRADE ? studentData.studentInfo?.DEBATE_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.DEBATE_OPINION ? studentData.studentInfo?.DEBATE_OPINION : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Group Activity</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.GROUP_GRADE ? studentData.studentInfo?.GROUP_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.GROUP_OPINION ? studentData.studentInfo?.GROUP_OPINION : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Stage Group Activity</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.STAGE_GROUP_GRADE ? studentData.studentInfo?.STAGE_GROUP_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.STAGE_GROUP_OPINION ? studentData.studentInfo?.STAGE_GROUP_OPINION : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Stage Performance</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.STAGE_GRADE ? studentData.studentInfo?.STAGE_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.STAGE_OPINION ? studentData.studentInfo?.STAGE_OPINION : <span className="text-gray-500">None</span>}</h1>
                    </div>
                    <div className='bg-white text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Bonus Points</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.BONUS_GRADE ? studentData.studentInfo?.BONUS_GRADE : <span className="text-gray-500">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.BONUS_OPINION ? studentData.studentInfo?.BONUS_OPINION : <span className="text-gray-500">None</span>}</h1>
                    </div>

                    <div className='bg-[#241E59]/40 text-black font-semibold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mt-4 mb-4 border border-gray-400'>
                      <h1 className='col-span-2 text-left text-sm sm:text-md' >Overall</h1>
                      <h1 className='col-span-1 text-center text-sm sm:text-md'>{studentData.studentInfo?.OVERALL_GRADE ? studentData.studentInfo?.OVERALL_GRADE : <span className="text-gray-700">Nill</span>}</h1>
                      <h1 className='col-span-2 text-center text-sm sm:text-md'>{studentData.studentInfo?.OVERALL_OPINION ? studentData.studentInfo?.OVERALL_OPINION : <span className="text-gray-700">None</span>}</h1>
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
                    {/* <div className='primary-bg text-white font-bold w-full grid grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 select-none'>
                      <h1 className='col-span-2 text-left text-pink-400' >Question</h1>
                      <h1 className='col-span-3 text-right'>Response</h1>
                    </div> */}
                    {studentData.formResponses ? (studentData.formResponses.map((response, index) => (
                      <div key={index} className='bg-stone text-black font-semibold w-full grid md:grid-cols-5 p-4 md:px-8 rounded-2xl mb-4 border border-gray-400 grid-cols-1 gap-y-4 md:gap-y-0'>
                        <h1 className='col-span-2 text-left text-sm sm:text-md flex items-start flex-nowrap text-gray-700 font-normal' >{response.question}
                          <span className="block md:hidden"> :-</span></h1>
                        <h1 className='col-span-3 text-left text-sm sm:text-md flex justify-end items-end primary-text'>{response.answer}</h1>
                      </div>
                    ))) : (
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
