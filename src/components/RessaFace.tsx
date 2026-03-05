import calmFace from '../assets/ressa/calm.svg';
import annoyedFace from '../assets/ressa/annoyed.svg';
import angryFace from '../assets/ressa/angry.svg';
import sleepingFace from '../assets/ressa/sleeping.svg';

type Mood = 'sleeping' | 'calm' | 'annoyed' | 'angry';

type RessaFaceProps = {
  mood: Mood;
  loud: boolean;
  animate?: boolean;
};

const FACE_MAP: Record<Mood, string> = {
  sleeping: sleepingFace,
  calm: calmFace,
  annoyed: annoyedFace,
  angry: angryFace
};

const RessaFace = ({ mood, loud, animate = false }: RessaFaceProps): JSX.Element => (
  <div className={`ressa-face-shell ${loud ? 'shake' : ''} ${animate && !loud ? 'idle-float' : ''}`}>
    <img className="ressa-face" src={FACE_MAP[mood]} alt={`Ressa is ${mood}`} />
  </div>
);

export default RessaFace;
