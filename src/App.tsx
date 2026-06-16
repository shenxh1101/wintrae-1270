import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LevelSelect from "@/pages/LevelSelect";
import KitchenGame from "@/pages/KitchenGame";
import NumberLineGame from "@/pages/NumberLineGame";
import PuzzleGame from "@/pages/PuzzleGame";
import Rewards from "@/pages/Rewards";
import ReviewGame from "@/pages/ReviewGame";
import ParentDashboard from "@/pages/ParentDashboard";
import BadgeToast from "@/components/feedback/BadgeToast";

export default function App() {
  return (
    <Router>
      <BadgeToast />
      <Routes>
        <Route path="/" element={<LevelSelect />} />
        <Route path="/play/kitchen/:levelId" element={<KitchenGame />} />
        <Route path="/play/numberline/:levelId" element={<NumberLineGame />} />
        <Route path="/play/puzzle/:levelId" element={<PuzzleGame />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/rewards/review" element={<ReviewGame />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
