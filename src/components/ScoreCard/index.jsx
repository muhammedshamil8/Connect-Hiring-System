import {
    Card,
    CardBody,
    Typography,
    Input,
    Button,
} from "@material-tailwind/react";
import { useState } from "react";

function ScoreCard({ base, stuid, data, clear }) {

    const [communication, setCommunication] = useState(data.COMMUNICATION_GRADE !== undefined ? data.COMMUNICATION_GRADE : '');
    const [dedication, setDedication] = useState(data.DEDICATION_GRADE !== undefined ? data.DEDICATION_GRADE : '');
    const [skillAchieve, setSkillAchieve] = useState(data.SKILL_ACHIEVEMENTS !== undefined ? data.SKILL_ACHIEVEMENTS : '');
    const [skillAchievegrade, setSkillAchievegrade] = useState(data.SKILL_ACHIEVEMENT_GRADE !== undefined ? data.SKILL_ACHIEVEMENT_GRADE : '');
    const [interviewOverall, setInterviewOverall] = useState(data.INTERVIEW_OVERALL_GRADE !== undefined ? data.INTERVIEW_OVERALL_GRADE : '');
    

    const [debateScore, setDebateScore] = useState(data.DEBATE_GRADE !== undefined ? data.DEBATE_GRADE : '');
    const [grpActScore, setGrpActScore] = useState(data.GROUP_GRADE !== undefined ? data.GROUP_GRADE : '');
    const [stagePerScore, setStagePerScore] = useState(data.STAGE_GRADE !== undefined ? data.STAGE_GRADE : '');
    const [overallScore, setOverallScore] = useState(data.OVERALL_GRADE !== undefined ? data.OVERALL_GRADE : '');
    const [debateOpinion, setDebateOpinion] = useState(data.DEBATE_OPINION !== undefined ? data.DEBATE_OPINION : '');
    const [grpActOpinion, setGrpActOpinion] = useState(data.GROUP_OPINION !== undefined ? data.GROUP_OPINION : '');
    const [stagePerOpinion, setStagePerOpinion] = useState(data.STAGE_OPINION !== undefined ? data.STAGE_OPINION : '');
    const [overallOpinion, setOverallOpinion] = useState(data.OVERALL_OPINION !== undefined ? data.OVERALL_OPINION : '');

    const submitScores = async () => {
        base("Students").update(
            `${stuid}`,
            {
                COMMUNICATION_GRADE: `${communication}`,
                DEDICATION_GRADE: `${dedication}`,
                SKILL_ACHIEVEMENT_GRADE: `${skillAchievegrade}`,
                SKILL_ACHIEVEMENTS: `${skillAchieve}`,
                INTERVIEW_OVERALL_GRADE: `${interviewOverall}`,

                DEBATE_GRADE: `${debateScore}`,
                GROUP_GRADE: `${grpActScore}`,
                STAGE_GRADE: `${stagePerScore}`,
                OVERALL_GRADE: `${overallScore}`,
                DEBATE_OPINION: `${debateOpinion}`,
                GROUP_OPINION: `${grpActOpinion}`,
                STAGE_OPINION: `${stagePerOpinion}`,
                OVERALL_OPINION: `${overallOpinion}`,
            },
            function (err) {
                if (err) {
                    console.error(err);
                    return;
                } else {
                    clear()
                }
            }
        )
    };



    return (
        <Card className="mt-6 w-full">
            <CardBody className="">
                <Typography variant="h5" className="mb-3" color="blue-gray">
                    Interview {data.CHEST_NO}
                </Typography>
                <div className="flex gap-2 flex-col mb-4">
                    <Input
                        type="text"
                        onChange={(e) => {
                            setCommunication(e.target.value);
                        }}
                        label="Commuincation Skill"
                        value={communication}
                    />
                    <Input
                        type="text"
                        onChange={(e) => {
                            setDedication(e.target.value);
                        }}
                        label="Dedication"
                        value={dedication}
                    />
                    <Input
                        type="text"
                        onChange={(e) => {
                            setSkillAchieve(e.target.value);
                        }}
                        label="Skill & Achievement"
                        value={skillAchieve}
                    />
                    <Input
                        type="text"
                        onChange={(e) => {
                            setInterviewOverall(e.target.value);
                        }}
                        label="Interview Overall"
                        value={interviewOverall}
                    />
                </div>
                <Typography variant="h5" className="mb-3" color="blue-gray">
                    Selection
                </Typography>
                <div className="flex gap-4 flex-col">
                    <div className="flex flex-col gap-2">
                        <Input
                            type="number"
                            onChange={(e) => {
                                setDebateScore(e.target.value);
                            }}
                            label="Debate Score"
                            value={debateScore}
                        />
                        <Input
                            type="text"
                            onChange={(e) => {
                                setDebateOpinion(e.target.value);
                            }}
                            label="Debate Opinion"
                            value={debateOpinion}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Input
                            type="number"
                            onChange={(e) => {
                                setGrpActScore(e.target.value);
                            }}
                            label="Group Activity Score"
                            value={grpActScore}
                        />
                        <Input
                            type="text"
                            onChange={(e) => {
                                setGrpActOpinion(e.target.value);
                            }}
                            label="Group Activity Opinion"
                            value={grpActOpinion}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Input
                            type="number"
                            onChange={(e) => {
                                setStagePerScore(e.target.value);
                            }}
                            label="Stage Performance Score"
                            value={stagePerScore}
                        />
                        <Input
                            type="text"
                            onChange={(e) => {
                                setStagePerOpinion(e.target.value);
                            }}
                            label="Stage Performance Opinion"
                            value={stagePerOpinion}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Input
                            type="number"
                            onChange={(e) => {
                                setOverallScore(e.target.value);
                            }}
                            label="Overall Score"
                            value={overallScore}
                        />
                        <Input
                            type="text"
                            onChange={(e) => {
                                setOverallOpinion(e.target.value);
                            }}
                            label="Overall Opinion"
                            value={overallOpinion}
                        />
                    </div>
                    <Button
                        className="w-full bg-green-500 mt-2"
                        onClick={() => {
                            submitScores();
                        }}
                    >
                        Submit
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

export default ScoreCard;
