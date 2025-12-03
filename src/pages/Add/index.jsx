import React, { useState, useCallback, useMemo } from "react";
import Airtable from "airtable";
import backendUrl from "@/const/backendUrl";
import {
  Button,
  Input,
  Card,
  CardBody,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import CustomMultiSelect from "@/components/MultiSelect";
import { Search, Save, Loader, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const base = new Airtable({ apiKey: `${backendUrl.secretKey}` }).base(
  `${backendUrl.airtableBase}`
);

const EVALUATORS = [
  "Shamil",
  "Dayyan",
  "Afrin",
  "Fahmiya",
  "Musfira",
  "Fadil",
  "Hilfa",
  "Ramess",
  "Mushrifa",
  "Nourin",
  "Sinan",
  "Salman",
  "Muhsina",
  "Swalih",
  "Nasrin",
  "Haneena",
  "Rafa",
  "Nayla",
  "Rizwan",
  "Anshif",
  "Haniya",
  "Murshida",
  "Hani",
  "Other",
  "Fabin",
];



const ScoreInput = React.memo(function ScoreInput({
  criterion,
  value,
  reason,
  onScoreChange,
  onReasonChange,
}) {
  const handleSelect = useCallback(
    (e) => onScoreChange(criterion.key, e.target.value),
    [onScoreChange, criterion.key]
  );
  const handleText = useCallback(
    (e) => onReasonChange(criterion.key, e.target.value),
    [onReasonChange, criterion.key]
  );

  return (
    <Card className="p-4 mb-4">
      <CardBody className="p-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Typography variant="h6" className="text-gray-800">
              {criterion.label}
            </Typography>
            <Typography variant="small" className="text-gray-600 mt-1">
              {criterion.description}
            </Typography>
            <Typography variant="small" className="text-gray-500 mt-1">
              Max: {criterion.max} points
            </Typography>
          </div>
          <div className="ml-4">
            <select
              value={value ?? ""}
              onChange={handleSelect}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[100px]"
            >
              <option value="">Select score</option>
              {Array.from(
                { length: Math.floor(criterion.max / 0.5) + 1 },
                (_, i) => {
                  const score = (i * 0.5).toFixed(1); // ensures .5 increments are shown correctly
                  return (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  );
                }
              )}
            </select>

            <Typography
              variant="small"
              className="text-center text-gray-500 mt-1"
            >
              {value || 0}/{criterion.max}
            </Typography>
          </div>
        </div>

        <div>
          <Typography
            variant="small"
            className="font-medium text-gray-700 mb-2"
          >
            Reason / Comments
          </Typography>
          <textarea
            value={reason || ""}
            onChange={handleText}
            placeholder="Add comments or reasoning for this score..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px]"
            rows="3"
          />
        </div>
      </CardBody>
    </Card>
  );
});

const EvaluatorSection = React.memo(function EvaluatorSection({
  stageKey,
  value,
  onChange,
}) {
  // value assumed to be array
  return (
    <Card className="p-4 mb-4 bg-gray-50">
      <CardBody className="p-0">
        <Typography variant="h6" className="text-gray-800 mb-3">
          Evaluated by:
        </Typography>
        <CustomMultiSelect
          options={EVALUATORS}
          value={value || []}
          onChange={(selected) => onChange(stageKey, selected)}
          label="Select Evaluators"
          placeholder="Choose evaluators..."
        />
        {value && value.length > 0 && (
          <Typography variant="small" className="text-gray-600 mt-2">
            Selected: {value.join(", ")}
          </Typography>
        )}
      </CardBody>
    </Card>
  );
});

const StageSection = React.memo(function StageSection({
  title,
  stageKey,
  schema,
  stageName,
  evaluators,
  scores,
  reasons,
  saved,
  saving,
  onSave,
  onScoreChange,
  onReasonChange,
  onEvaluatorChange,
}) {
  return (
    <Card className="mb-6">
      <CardBody>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <Typography variant="h5" className="text-gray-900">
            {title}
          </Typography>
          <div className="flex items-center gap-2">
            {saved && <CheckCircle className="text-green-500" size={20} />}
            <Button
              onClick={() => onSave(stageName)}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              size="sm"
            >
              {saving ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save Stage"}
            </Button>
          </div>
        </div>

        <EvaluatorSection
          stageKey={stageKey}
          value={evaluators[stageKey] || []}
          onChange={onEvaluatorChange}
        />

        <div className="mt-4">
          {schema.map((criterion) => (
            <ScoreInput
              key={criterion.key}
              criterion={criterion}
              value={scores[criterion.key]}
              reason={reasons[criterion.key]}
              onScoreChange={onScoreChange}
              onReasonChange={onReasonChange}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
});



export default function ScoreFormFixed() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [searchMode, setSearchMode] = useState("admission");

  const S1_SCHEMA = useMemo(
    () => [
      {
        key: "S1_Completion_Timeliness",
        label: "Completion & Timeliness",
        max: 8,
        description: "How well did the candidate complete tasks on time?",
      },
      {
        key: "S1_Skill_Technical",
        label: "Skill & Technical Quality",
        max: 12,
        description: "Technical proficiency and skill level demonstrated",
      },
      {
        key: "S1_Originality",
        label: "Originality & Initiative",
        max: 6,
        description: "Creativity and proactive approach to tasks",
      },
      {
        key: "S1_Relevance",
        label: "Relevance to Role & Brief",
        max: 4,
        description:
          "How relevant were the submissions to the given role/brief?",
      },
    ],
    []
  );

  const S2_SCHEMA = useMemo(
    () => [
      {
        key: "S2_Interest",
        label: "Interest & Initiative",
        max: 7,
        description: "Level of interest shown and initiative taken",
      },
      {
        key: "S2_TaskUnderstanding",
        label: "Understanding of the Task",
        max: 7,
        description: "Comprehension of task requirements and objectives",
      },
      {
        key: "S2_Communication",
        label: "Communication Skills",
        max: 7,
        description: "Verbal and written communication abilities",
      },
      {
        key: "S2_TeamSpirit",
        label: "Team Spirit & Attitude",
        max: 7,
        description: "Collaborative attitude and team-oriented behavior",
      },
      {
        key: "S2_LearningMindset",
        label: "Learning Mindset",
        max: 7,
        description: "Willingness to learn and adapt to new challenges",
      },
    ],
    []
  );

  const S3_SCHEMA = useMemo(
    () => [
      {
        key: "S3_Teamwork",
        label: "Teamwork & Collaboration",
        max: 12,
        description: "Ability to work effectively in team settings",
      },
      {
        key: "S3_Leadership",
        label: "Leadership & Initiative",
        max: 10,
        description: "Leadership qualities and taking initiative",
      },
      {
        key: "S3_ProblemSolving",
        label: "Problem Solving & Creativity",
        max: 8,
        description: "Approach to problem-solving and creative thinking",
      },
      {
        key: "S3_Reliability",
        label: "Reliability & Responsibility",
        max: 5,
        description: "Dependability and sense of responsibility",
      },
    ],
    []
  );

  const [scores, setScores] = useState({});
  const [reasons, setReasons] = useState({});
  const [bonus, setBonus] = useState(0);
  const [bonusReason, setBonusReason] = useState("");
  const [evaluators, setEvaluators] = useState({
    S1_Evaluators: [],
    S2_Evaluators: [],
    S3_Evaluators: [],
  });
  const [savedStages, setSavedStages] = useState({
    stage1: false,
    stage2: false,
    stage3: false,
    bonus: false,
  });

  const getStudent = useCallback(
    async (search) => {
      if (!search) return;
      setLoading(true);
      setStudentData(null);
      setScores({});
      setReasons({});
      setBonus(0);
      setBonusReason("");
      setEvaluators({
        S1_Evaluators: [],
        S2_Evaluators: [],
        S3_Evaluators: [],
      });
      setSavedStages({
        stage1: false,
        stage2: false,
        stage3: false,
        bonus: false,
      });

      try {
        const filterFormula =
          searchMode === "chest"
            ? `{CHEST_NO} = '${search.toUpperCase()}'`
            : `{Admission_No} = '${search}'`;

        const formRecords = await base("interns_selection_2025")
          .select({
            view: "Applicants",
            filterByFormula: filterFormula,
            maxRecords: 1,
          })
          .firstPage();

        const scoresRecords = await base("Scores")
          .select({
            view: "Data",
            filterByFormula: filterFormula,
            maxRecords: 1,
          })
          .firstPage();

        const formRec = formRecords[0]?.fields ?? null;
        const scoresRec = scoresRecords[0]?.fields ?? null;

        if (!formRec) {
          toast.error("No student found with the provided search criteria");
          setLoading(false);
          return;
        }

        const student = {
          admissionNo: formRec.Admission_No,
          name: formRec.Name,
          department: formRec.department,
          chestNo: scoresRec.CHEST_NO || formRec.CHEST_NO,
          recordId: scoresRecords[0]?.id,
        };

        setStudentData(student);

        if (scoresRec) {
          const existingScores = {};
          const existingReasons = {};
          const existingEvaluators = {
            S1_Evaluators: [],
            S2_Evaluators: [],
            S3_Evaluators: [],
          };

          [...S1_SCHEMA, ...S2_SCHEMA, ...S3_SCHEMA].forEach((criterion) => {
            if (scoresRec[criterion.key] !== undefined) {
              existingScores[criterion.key] = scoresRec[criterion.key];
            }
            if (scoresRec[`${criterion.key}_Reason`] !== undefined) {
              existingReasons[criterion.key] =
                scoresRec[`${criterion.key}_Reason`];
            }
          });

          if (scoresRec.S1_Evaluators) {
            existingEvaluators.S1_Evaluators = Array.isArray(
              scoresRec.S1_Evaluators
            )
              ? scoresRec.S1_Evaluators
              : typeof scoresRec.S1_Evaluators === "string"
                ? scoresRec.S1_Evaluators.split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                : [scoresRec.S1_Evaluators];
          }
          if (scoresRec.S2_Evaluators) {
            existingEvaluators.S2_Evaluators = Array.isArray(
              scoresRec.S2_Evaluators
            )
              ? scoresRec.S2_Evaluators
              : typeof scoresRec.S2_Evaluators === "string"
                ? scoresRec.S2_Evaluators.split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                : [scoresRec.S2_Evaluators];
          }
          if (scoresRec.S3_Evaluators) {
            existingEvaluators.S3_Evaluators = Array.isArray(
              scoresRec.S3_Evaluators
            )
              ? scoresRec.S3_Evaluators
              : typeof scoresRec.S3_Evaluators === "string"
                ? scoresRec.S3_Evaluators.split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                : [scoresRec.S3_Evaluators];
          }

          if (scoresRec.Bonus_Participation !== undefined) {
            setBonus(scoresRec.Bonus_Participation);
          }
          if (scoresRec.Bonus_Participation_Reason !== undefined) {
            setBonusReason(scoresRec.Bonus_Participation_Reason);
          }

          setScores(existingScores);
          setReasons(existingReasons);
          setEvaluators(existingEvaluators);

          setSavedStages({
            stage1: existingEvaluators.S1_Evaluators.length > 0,
            stage2: existingEvaluators.S2_Evaluators.length > 0,
            stage3: existingEvaluators.S3_Evaluators.length > 0,
            bonus: scoresRec.Bonus_Participation !== undefined,
          });
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Error fetching student data");
      } finally {
        setLoading(false);
      }
    },
    [searchMode, S1_SCHEMA, S2_SCHEMA, S3_SCHEMA]
  );

  const handleScoreChange = useCallback((criterionKey, value) => {
    const numValue = value !== "" ? parseFloat(value, 10) : "";
    setScores((prev) => ({ ...prev, [criterionKey]: numValue }));
  }, []);

  const handleReasonChange = useCallback((criterionKey, value) => {
    setReasons((prev) => ({ ...prev, [criterionKey]: value }));
  }, []);

  const handleBonusChange = useCallback((value) => {
    setBonus(value !== "" ? parseInt(value, 10) : "");
  }, []);

  const handleBonusReasonChange = useCallback((value) => {
    setBonusReason(value);
  }, []);

  const handleEvaluatorChange = useCallback((stageKey, selectedEvaluators) => {
    setEvaluators((prev) => ({ ...prev, [stageKey]: selectedEvaluators }));
  }, []);

  const calculateTotal = useCallback(
    (schema) =>
      schema.reduce(
        (total, criterion) => total + (scores[criterion.key] || 0),
        0
      ),
    [scores]
  );

  const calculateGrandTotal = useCallback(() => {
    const s1Total = calculateTotal(S1_SCHEMA);
    const s2Total = calculateTotal(S2_SCHEMA);
    const s3Total = calculateTotal(S3_SCHEMA);
    return s1Total + s2Total + s3Total + (bonus || 0);
  }, [calculateTotal, S1_SCHEMA, S2_SCHEMA, S3_SCHEMA, bonus]);

  const saveStage = useCallback(
    async (stage) => {
      if (!studentData) return;
      setSaving((prev) => ({ ...prev, [stage]: true }));

      try {
        const fields = {
          // Name: studentData.name,
          // Admission_No: studentData.admissionNo,
          // CHEST_NO: studentData.chestNo,
          // department: studentData.department,
        };

        if (stage === "stage1") {
          S1_SCHEMA.forEach((criterion) => {
            if (scores[criterion.key] !== undefined)
              fields[criterion.key] = scores[criterion.key];
            if (reasons[criterion.key] !== undefined)
              fields[`${criterion.key}_Reason`] = reasons[criterion.key];
          });
          fields.S1_Evaluators = evaluators.S1_Evaluators;
        } else if (stage === "stage2") {
          S2_SCHEMA.forEach((criterion) => {
            if (scores[criterion.key] !== undefined)
              fields[criterion.key] = scores[criterion.key];
            if (reasons[criterion.key] !== undefined)
              fields[`${criterion.key}_Reason`] = reasons[criterion.key];
          });
          fields.S2_Evaluators = evaluators.S2_Evaluators;
        } else if (stage === "stage3") {
          S3_SCHEMA.forEach((criterion) => {
            if (scores[criterion.key] !== undefined)
              fields[criterion.key] = scores[criterion.key];
            if (reasons[criterion.key] !== undefined)
              fields[`${criterion.key}_Reason`] = reasons[criterion.key];
          });
          fields.S3_Evaluators = evaluators.S3_Evaluators;
        } else if (stage === "bonus") {
          fields.Bonus_Participation = bonus || 0;
          fields.Bonus_Participation_Reason = bonusReason || "";
        }

        console.log("Saving fields:", fields);

        if (studentData.recordId) {
          await base("Scores").update(studentData.recordId, fields);
        } else {
          const record = await base("Scores").create([{ fields }]);
          setStudentData((prev) => ({ ...prev, recordId: record[0].id }));
        }

        setSavedStages((prev) => ({ ...prev, [stage]: true }));
        toast.success(`${getStageName(stage)} saved successfully!`);
      } catch (error) {
        console.error(`Error saving ${stage}:`, error);
        toast.error(
          `Error saving ${getStageName(stage)}: ${error?.message || "Unknown error"
          }`
        );
      } finally {
        setSaving((prev) => ({ ...prev, [stage]: false }));
      }
    },
    [
      studentData,
      scores,
      reasons,
      evaluators,
      bonus,
      bonusReason,
      S1_SCHEMA,
      S2_SCHEMA,
      S3_SCHEMA,
    ]
  );

  function getStageName(stage) {
    const names = {
      stage1: "Stage 1 - Task Evaluation",
      stage2: "Stage 2 - Interview Assessment",
      stage3: "Stage 3 - Camp Performance",
      bonus: "Bonus Points",
    };
    return names[stage] || stage;
  }

  return (
    <div className="w-full p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardBody className="!pt-0">
            <div className="text-xl font-bold mb-4 text-center">
              Update Candidate Scores
            </div>
            <div className="flex justify-between p-2 flex-wrap-reverse gap-4 mb-4">
              <div className="flex items-center justify-center gap-4 my-4 bg-gray-200 w-fit rounded-full p-1">
                <Button
                  variant={searchMode === "chest" ? "filled" : "text"}
                  onClick={() => setSearchMode("chest")}
                  className={`rounded-full ${searchMode === "chest"
                    ? "bg-indigo-700"
                    : "bg-transparent text-gray-700"
                    }`}
                >
                  Chest No
                </Button>
                <Button
                  variant={searchMode === "admission" ? "filled" : "text"}
                  onClick={() => setSearchMode("admission")}
                  className={`rounded-full ${searchMode === "admission"
                    ? "bg-indigo-700"
                    : "bg-transparent text-gray-700"
                    }`}
                >
                  Admission No
                </Button>
              </div>

              {/* <Button
                onClick={() => navigate("/admin/list")}
                className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center gap-2 p-4 rounded-lg h-fit"
              >
                <ArrowLeft size={16} /> Back to List
              </Button> */}
            </div>
            <div className="flex items-center gap-3 flex-wrap ">
              <div className="flex-1">
                <Input
                  label={`Search by ${searchMode === "chest" ? "Chest No" : "Admission No"
                    }`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") getStudent(searchText.trim());
                  }}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => getStudent(searchText.trim())}
                disabled={loading}
                className="bg-indigo-700 hover:bg-indigo-800 flex items-center gap-2 w-fit"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardBody>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-indigo-700 mr-2" />
            <Typography>Loading candidate data...</Typography>
          </div>
        )}

        {studentData && (
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-indigo-700 text-white font-bold p-3 rounded-xl text-lg">
                    {studentData.chestNo}
                  </div>
                  <div>
                    <Typography variant="h4">{studentData.name}</Typography>
                    <Typography variant="lead" className="text-gray-600">
                      {studentData.department}
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                      Admission No: {studentData.admissionNo}
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardBody className="text-center">
                  <Typography
                    variant="small"
                    className="text-blue-600 uppercase font-semibold"
                  >
                    Stage 1 - Task
                  </Typography>
                  <Typography variant="h3" className="text-blue-700">
                    {calculateTotal(S1_SCHEMA)}/30
                  </Typography>
                  {savedStages.stage1 && (
                    <CheckCircle
                      className="text-green-500 mt-2 mx-auto"
                      size={20}
                    />
                  )}
                </CardBody>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardBody className="text-center">
                  <Typography
                    variant="small"
                    className="text-green-600 uppercase font-semibold"
                  >
                    Stage 2 - Interview
                  </Typography>
                  <Typography variant="h3" className="text-green-700">
                    {calculateTotal(S2_SCHEMA)}/35
                  </Typography>
                  {savedStages.stage2 && (
                    <CheckCircle
                      className="text-green-500 mt-2 mx-auto"
                      size={20}
                    />
                  )}
                </CardBody>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardBody className="text-center">
                  <Typography
                    variant="small"
                    className="text-purple-600 uppercase font-semibold"
                  >
                    Stage 3 - Camp
                  </Typography>
                  <Typography variant="h3" className="text-purple-700">
                    {calculateTotal(S3_SCHEMA)}/35
                  </Typography>
                  {savedStages.stage3 && (
                    <CheckCircle
                      className="text-green-500 mt-2 mx-auto"
                      size={20}
                    />
                  )}
                </CardBody>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardBody className="text-center">
                  <Typography
                    variant="small"
                    className="text-orange-600 uppercase font-semibold"
                  >
                    Bonus Points
                  </Typography>
                  <Typography variant="h3" className="text-orange-700">
                    {bonus || 0}/5
                  </Typography>
                  <Typography variant="small" className="text-orange-400 mt-2">
                    Total:{" "}
                    <span className="font-semibold">
                      {calculateGrandTotal()}/105
                    </span>
                  </Typography>
                  {savedStages.bonus && (
                    <CheckCircle
                      className="text-green-500 mt-2 mx-auto"
                      size={20}
                    />
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Stage Sections */}
            <StageSection
              title="Stage 1 — Task Evaluation (30 points)"
              stageKey="S1_Evaluators"
              schema={S1_SCHEMA}
              stageName="stage1"
              evaluators={evaluators}
              scores={scores}
              reasons={reasons}
              saved={savedStages.stage1}
              saving={saving.stage1}
              onSave={saveStage}
              onScoreChange={handleScoreChange}
              onReasonChange={handleReasonChange}
              onEvaluatorChange={handleEvaluatorChange}
            />

            <StageSection
              title="Stage 2 — Interview Assessment (35 points)"
              stageKey="S2_Evaluators"
              schema={S2_SCHEMA}
              stageName="stage2"
              evaluators={evaluators}
              scores={scores}
              reasons={reasons}
              saved={savedStages.stage2}
              saving={saving.stage2}
              onSave={saveStage}
              onScoreChange={handleScoreChange}
              onReasonChange={handleReasonChange}
              onEvaluatorChange={handleEvaluatorChange}
            />

            <StageSection
              title="Stage 3 — Camp Performance (35 points)"
              stageKey="S3_Evaluators"
              schema={S3_SCHEMA}
              stageName="stage3"
              evaluators={evaluators}
              scores={scores}
              reasons={reasons}
              saved={savedStages.stage3}
              saving={saving.stage3}
              onSave={saveStage}
              onScoreChange={handleScoreChange}
              onReasonChange={handleReasonChange}
              onEvaluatorChange={handleEvaluatorChange}
            />

            {/* Bonus Points */}
            <Card>
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h5">Bonus Points</Typography>
                  <div className="flex items-center gap-2">
                    {savedStages.bonus && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                    <Button
                      onClick={() => saveStage("bonus")}
                      disabled={saving.bonus}
                      className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                      size="sm"
                    >
                      {saving.bonus ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving.bonus ? "Saving..." : "Save Bonus"}
                    </Button>
                  </div>
                </div>

                <div className="max-w-xs">
                  <Select
                    value={bonus?.toString() || ""}
                    onChange={(v) => handleBonusChange(v)}
                    label="Bonus Participation (0-5 points)"
                  >
                    <Option value="">Select bonus</Option>
                    {Array.from({ length: 6 }, (_, i) => (
                      <Option key={i} value={i.toString()}>
                        {i}
                      </Option>
                    ))}
                  </Select>

                  <div className="mt-3">
                    <Typography
                      variant="small"
                      className="font-medium text-gray-700 mb-2"
                    >
                      Bonus Reason
                    </Typography>
                    <textarea
                      value={bonusReason}
                      onChange={(e) => handleBonusReasonChange(e.target.value)}
                      placeholder="Reason for bonus..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px]"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* if not searched and starting */}
        {!loading && !studentData && (
          <div className="text-center text-gray-500 mt-12">
            Please search for a candidate using their Chest No or Admission No.
          </div>
        )}
      </div>
    </div>
  );
}
