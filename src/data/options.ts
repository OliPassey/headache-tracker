import { TriggerOption, SymptomOption, MedicationOption, LocationOption, ReliefOption } from '@/types/headache';

export const TRIGGER_OPTIONS: TriggerOption[] = [
  // Food triggers
  { id: 'aged-cheese', name: 'Aged cheese', category: 'food' },
  { id: 'chocolate', name: 'Chocolate', category: 'food' },
  { id: 'alcohol', name: 'Alcohol (any)', category: 'food' },
  { id: 'red-wine', name: 'Red wine', category: 'food' },
  { id: 'caffeine', name: 'Caffeine', category: 'food' },
  { id: 'caffeine-withdrawal', name: 'Caffeine withdrawal', category: 'food' },
  { id: 'msg', name: 'MSG (monosodium glutamate)', category: 'food' },
  { id: 'aspartame', name: 'Aspartame', category: 'food' },
  { id: 'nitrates', name: 'Nitrates/Nitrites', category: 'food' },
  { id: 'tyramine', name: 'Tyramine-rich foods', category: 'food' },
  { id: 'skipped-meal', name: 'Skipped meal', category: 'food' },
  { id: 'dehydration', name: 'Dehydration', category: 'food' },
  
  // Environmental triggers
  { id: 'bright-lights', name: 'Bright lights', category: 'environmental' },
  { id: 'flashing-lights', name: 'Flashing lights', category: 'environmental' },
  { id: 'loud-sounds', name: 'Loud sounds', category: 'environmental' },
  { id: 'strong-smells', name: 'Strong smells', category: 'environmental' },
  { id: 'weather-change', name: 'Weather changes', category: 'environmental' },
  { id: 'barometric-pressure', name: 'Barometric pressure changes', category: 'environmental' },
  { id: 'high-altitude', name: 'High altitude', category: 'environmental' },
  { id: 'air-quality', name: 'Poor air quality', category: 'environmental' },
  { id: 'allergens', name: 'Allergens', category: 'environmental' },
  
  // Hormonal triggers
  { id: 'menstruation', name: 'Menstruation', category: 'hormonal' },
  { id: 'ovulation', name: 'Ovulation', category: 'hormonal' },
  { id: 'birth-control', name: 'Birth control', category: 'hormonal' },
  { id: 'hrt', name: 'Hormone replacement therapy', category: 'hormonal' },
  { id: 'pregnancy', name: 'Pregnancy', category: 'hormonal' },
  { id: 'menopause', name: 'Menopause', category: 'hormonal' },
  
  // Lifestyle triggers
  { id: 'lack-of-sleep', name: 'Lack of sleep', category: 'lifestyle' },
  { id: 'too-much-sleep', name: 'Too much sleep', category: 'lifestyle' },
  { id: 'sleep-schedule-change', name: 'Sleep schedule change', category: 'lifestyle' },
  { id: 'jet-lag', name: 'Jet lag', category: 'lifestyle' },
  { id: 'irregular-schedule', name: 'Irregular schedule', category: 'lifestyle' },
  
  // Emotional triggers
  { id: 'stress', name: 'Stress', category: 'emotional' },
  { id: 'anxiety', name: 'Anxiety', category: 'emotional' },
  { id: 'depression', name: 'Depression', category: 'emotional' },
  { id: 'excitement', name: 'Excitement', category: 'emotional' },
  { id: 'letdown', name: 'Post-stress letdown', category: 'emotional' },
  
  // Physical triggers
  { id: 'neck-tension', name: 'Neck tension', category: 'physical' },
  { id: 'eye-strain', name: 'Eye strain', category: 'physical' },
  { id: 'exercise', name: 'Intense exercise', category: 'physical' },
  { id: 'head-injury', name: 'Head injury', category: 'physical' },
  { id: 'dental-problems', name: 'Dental problems', category: 'physical' },
  
  // Medication triggers
  { id: 'medication-overuse', name: 'Medication overuse', category: 'medication' },
  { id: 'vasodilators', name: 'Vasodilators', category: 'medication' },
  { id: 'nitroglycerin', name: 'Nitroglycerin', category: 'medication' },
];

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  // Pain symptoms
  { id: 'throbbing', name: 'Throbbing/pulsing pain', category: 'pain' },
  { id: 'stabbing', name: 'Stabbing/sharp pain', category: 'pain' },
  { id: 'burning', name: 'Burning pain', category: 'pain' },
  { id: 'pressure', name: 'Pressure/squeezing', category: 'pain' },
  { id: 'aching', name: 'Dull aching', category: 'pain' },
  
  // Neurological symptoms
  { id: 'aura-visual', name: 'Visual aura (flashes, zigzags)', category: 'neurological' },
  { id: 'aura-sensory', name: 'Sensory aura (tingling, numbness)', category: 'neurological' },
  { id: 'aura-speech', name: 'Speech difficulties', category: 'neurological' },
  { id: 'confusion', name: 'Confusion/brain fog', category: 'neurological' },
  { id: 'dizziness', name: 'Dizziness/vertigo', category: 'neurological' },
  { id: 'coordination', name: 'Poor coordination', category: 'neurological' },
  
  // Gastrointestinal symptoms
  { id: 'nausea', name: 'Nausea', category: 'gastrointestinal' },
  { id: 'vomiting', name: 'Vomiting', category: 'gastrointestinal' },
  { id: 'loss-appetite', name: 'Loss of appetite', category: 'gastrointestinal' },
  { id: 'food-cravings', name: 'Food cravings', category: 'gastrointestinal' },
  
  // Autonomic symptoms
  { id: 'tearing', name: 'Excessive tearing', category: 'autonomic' },
  { id: 'runny-nose', name: 'Runny/stuffy nose', category: 'autonomic' },
  { id: 'facial-sweating', name: 'Facial sweating', category: 'autonomic' },
  { id: 'red-eye', name: 'Red/bloodshot eye', category: 'autonomic' },
  { id: 'droopy-eyelid', name: 'Droopy eyelid', category: 'autonomic' },
  { id: 'pupil-constriction', name: 'Pupil constriction', category: 'autonomic' },
  { id: 'restlessness', name: 'Restlessness/agitation', category: 'autonomic' },
  
  // Visual symptoms
  { id: 'light-sensitivity', name: 'Light sensitivity', category: 'visual' },
  { id: 'blurred-vision', name: 'Blurred vision', category: 'visual' },
  { id: 'vision-loss', name: 'Temporary vision loss', category: 'visual' },
  { id: 'double-vision', name: 'Double vision', category: 'visual' },
  
  // Sensory symptoms
  { id: 'sound-sensitivity', name: 'Sound sensitivity', category: 'sensory' },
  { id: 'smell-sensitivity', name: 'Smell sensitivity', category: 'sensory' },
  { id: 'touch-sensitivity', name: 'Touch sensitivity', category: 'sensory' },
  { id: 'scalp-tenderness', name: 'Scalp tenderness', category: 'sensory' },
];

export const LOCATION_OPTIONS: LocationOption[] = [
  { id: 'left-temple', name: 'Left temple', side: 'left' },
  { id: 'right-temple', name: 'Right temple', side: 'right' },
  { id: 'left-forehead', name: 'Left forehead', side: 'left' },
  { id: 'right-forehead', name: 'Right forehead', side: 'right' },
  { id: 'left-eye', name: 'Left eye/around eye', side: 'left' },
  { id: 'right-eye', name: 'Right eye/around eye', side: 'right' },
  { id: 'left-side', name: 'Left side of head', side: 'left' },
  { id: 'right-side', name: 'Right side of head', side: 'right' },
  { id: 'back-head', name: 'Back of head', side: 'bilateral' },
  { id: 'top-head', name: 'Top of head', side: 'bilateral' },
  { id: 'whole-head', name: 'Whole head', side: 'bilateral' },
  { id: 'neck', name: 'Neck', side: 'bilateral' },
  { id: 'jaw', name: 'Jaw', side: 'varies' },
  { id: 'sinus', name: 'Sinus area', side: 'varies' },
];

export const MEDICATION_OPTIONS: MedicationOption[] = [
  // Acute/rescue medications
  { id: 'ibuprofen', name: 'Ibuprofen', type: 'acute', dosage: '200-800mg' },
  { id: 'acetaminophen', name: 'Acetaminophen/Paracetamol', type: 'acute', dosage: '500-1000mg' },
  { id: 'aspirin', name: 'Aspirin', type: 'acute', dosage: '325-650mg' },
  { id: 'naproxen', name: 'Naproxen', type: 'acute', dosage: '220-440mg' },
  { id: 'sumatriptan', name: 'Sumatriptan', type: 'acute', dosage: '25-100mg' },
  { id: 'rizatriptan', name: 'Rizatriptan', type: 'acute', dosage: '5-10mg' },
  { id: 'zolmitriptan', name: 'Zolmitriptan', type: 'acute', dosage: '2.5-5mg' },
  { id: 'almotriptan', name: 'Almotriptan', type: 'acute', dosage: '6.25-12.5mg' },
  { id: 'eletriptan', name: 'Eletriptan', type: 'acute', dosage: '20-40mg' },
  { id: 'frovatriptan', name: 'Frovatriptan', type: 'acute', dosage: '2.5mg' },
  { id: 'naratriptan', name: 'Naratriptan', type: 'acute', dosage: '1-2.5mg' },
  { id: 'excedrin', name: 'Excedrin Migraine', type: 'acute' },
  { id: 'caffeine', name: 'Caffeine', type: 'acute', dosage: '100-200mg' },
  
  // Cluster headache specific
  { id: 'oxygen', name: 'High-flow oxygen', type: 'rescue', dosage: '15L/min' },
  { id: 'sumatriptan-injection', name: 'Sumatriptan injection', type: 'rescue', dosage: '6mg' },
  { id: 'zolmitriptan-nasal', name: 'Zolmitriptan nasal spray', type: 'rescue', dosage: '5mg' },
  
  // Preventive medications
  { id: 'propranolol', name: 'Propranolol', type: 'preventive', dosage: '40-240mg daily' },
  { id: 'topiramate', name: 'Topiramate', type: 'preventive', dosage: '25-200mg daily' },
  { id: 'amitriptyline', name: 'Amitriptyline', type: 'preventive', dosage: '10-150mg daily' },
  { id: 'verapamil', name: 'Verapamil', type: 'preventive', dosage: '120-480mg daily' },
  { id: 'lithium', name: 'Lithium', type: 'preventive' },
  { id: 'melatonin', name: 'Melatonin', type: 'preventive', dosage: '3-12mg' },
  { id: 'magnesium', name: 'Magnesium', type: 'preventive', dosage: '400-600mg daily' },
  { id: 'coq10', name: 'CoQ10', type: 'preventive', dosage: '100-300mg daily' },
  { id: 'riboflavin', name: 'Riboflavin (B2)', type: 'preventive', dosage: '400mg daily' },
];

export const RELIEF_OPTIONS: ReliefOption[] = [
  // Medication
  { id: 'medication-effective', name: 'Medication was effective', category: 'medication' },
  { id: 'medication-partial', name: 'Medication partially effective', category: 'medication' },
  { id: 'medication-ineffective', name: 'Medication ineffective', category: 'medication' },
  
  // Environmental
  { id: 'dark-room', name: 'Dark, quiet room', category: 'environmental' },
  { id: 'cold-compress', name: 'Cold compress/ice', category: 'environmental' },
  { id: 'heat-therapy', name: 'Heat therapy', category: 'environmental' },
  { id: 'fresh-air', name: 'Fresh air', category: 'environmental' },
  
  // Physical therapy
  { id: 'sleep', name: 'Sleep/rest', category: 'therapy' },
  { id: 'massage', name: 'Massage', category: 'therapy' },
  { id: 'pressure-points', name: 'Pressure point therapy', category: 'therapy' },
  { id: 'stretching', name: 'Neck/shoulder stretches', category: 'therapy' },
  { id: 'relaxation', name: 'Relaxation techniques', category: 'therapy' },
  { id: 'meditation', name: 'Meditation', category: 'therapy' },
  
  // Physical actions
  { id: 'hydration', name: 'Hydration', category: 'physical' },
  { id: 'movement', name: 'Light movement/walking', category: 'physical' },
  { id: 'pacing', name: 'Pacing/restlessness', category: 'physical' },
  { id: 'vomiting', name: 'Vomiting provided relief', category: 'physical' },
];
