export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports';
  muscle_groups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
  variations: string[];
}

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'lower_back', 'glutes', 'quadriceps', 
  'hamstrings', 'calves', 'full_body'
];

export const EQUIPMENT = [
  'bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
  'pull_up_bar', 'bench', 'cable_machine', 'smith_machine', 'leg_press',
  'rowing_machine', 'treadmill', 'stationary_bike'
];

export const EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'push_up',
    name: 'Push-Up',
    category: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in plank position with hands slightly wider than shoulders',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core tight and body in straight line'
    ],
    tips: [
      'Keep elbows at 45-degree angle to body',
      'Don\'t let hips sag or pike up',
      'Full range of motion for maximum benefit'
    ],
    variations: ['Incline Push-Up', 'Decline Push-Up', 'Diamond Push-Up', 'Wide-Grip Push-Up']
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    category: 'strength',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on bench with eyes under the bar',
      'Grip bar slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar back up to starting position'
    ],
    tips: [
      'Keep feet flat on floor',
      'Maintain slight arch in lower back',
      'Don\'t bounce bar off chest'
    ],
    variations: ['Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press']
  },
  {
    id: 'dumbbell_flyes',
    name: 'Dumbbell Flyes',
    category: 'strength',
    muscle_groups: ['chest'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on bench holding dumbbells above chest',
      'Lower weights in wide arc until chest stretch',
      'Bring weights back together above chest',
      'Maintain slight bend in elbows throughout'
    ],
    tips: [
      'Focus on chest squeeze at top',
      'Control the negative portion',
      'Don\'t go too heavy - form is key'
    ],
    variations: ['Incline Flyes', 'Cable Flyes', 'Pec Deck Flyes']
  },

  // BACK
  {
    id: 'pull_up',
    name: 'Pull-Up',
    category: 'strength',
    muscle_groups: ['back', 'biceps'],
    equipment: ['pull_up_bar'],
    difficulty: 'intermediate',
    instructions: [
      'Hang from bar with overhand grip',
      'Pull body up until chin clears bar',
      'Lower with control to full extension',
      'Keep core engaged throughout'
    ],
    tips: [
      'Don\'t swing or use momentum',
      'Focus on pulling with back muscles',
      'Full range of motion for best results'
    ],
    variations: ['Chin-Up', 'Wide-Grip Pull-Up', 'Assisted Pull-Up', 'Weighted Pull-Up']
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'strength',
    muscle_groups: ['back', 'glutes', 'hamstrings'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip bar',
      'Keep chest up and back straight',
      'Drive through heels to stand up with bar'
    ],
    tips: [
      'Keep bar close to body throughout lift',
      'Don\'t round your back',
      'Engage core for stability'
    ],
    variations: ['Romanian Deadlift', 'Sumo Deadlift', 'Trap Bar Deadlift']
  },
  {
    id: 'bent_over_row',
    name: 'Bent-Over Row',
    category: 'strength',
    muscle_groups: ['back', 'biceps'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: [
      'Bend at hips with slight knee bend',
      'Hold bar with overhand grip',
      'Pull bar to lower chest/upper abdomen',
      'Lower with control'
    ],
    tips: [
      'Keep back straight throughout',
      'Squeeze shoulder blades together',
      'Don\'t use momentum'
    ],
    variations: ['Dumbbell Row', 'T-Bar Row', 'Cable Row']
  },

  // LEGS
  {
    id: 'squat',
    name: 'Squat',
    category: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower by bending knees and hips',
      'Go down until thighs parallel to floor',
      'Drive through heels to return to start'
    ],
    tips: [
      'Keep knees in line with toes',
      'Don\'t let knees cave inward',
      'Keep chest up and core tight'
    ],
    variations: ['Goblet Squat', 'Front Squat', 'Back Squat', 'Bulgarian Split Squat']
  },
  {
    id: 'lunge',
    name: 'Lunge',
    category: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Step forward into lunge position',
      'Lower back knee toward ground',
      'Push off front foot to return to start',
      'Alternate legs or complete one side'
    ],
    tips: [
      'Keep front knee over ankle',
      'Don\'t let front knee drift forward',
      'Maintain upright torso'
    ],
    variations: ['Reverse Lunge', 'Walking Lunge', 'Lateral Lunge', 'Curtsy Lunge']
  },

  // SHOULDERS
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    category: 'strength',
    muscle_groups: ['shoulders', 'triceps'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: [
      'Hold dumbbells at shoulder height',
      'Press weights straight overhead',
      'Lower with control to starting position',
      'Keep core engaged throughout'
    ],
    tips: [
      'Don\'t arch back excessively',
      'Press straight up, not forward',
      'Control the descent'
    ],
    variations: ['Military Press', 'Arnold Press', 'Pike Push-Up']
  },
  {
    id: 'lateral_raise',
    name: 'Lateral Raise',
    category: 'strength',
    muscle_groups: ['shoulders'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    instructions: [
      'Hold dumbbells at sides',
      'Raise arms out to sides until parallel to floor',
      'Lower with control',
      'Keep slight bend in elbows'
    ],
    tips: [
      'Lead with pinkies, not thumbs',
      'Don\'t swing or use momentum',
      'Focus on controlled movement'
    ],
    variations: ['Front Raise', 'Rear Delt Fly', 'Cable Lateral Raise']
  },

  // ARMS
  {
    id: 'bicep_curl',
    name: 'Bicep Curl',
    category: 'strength',
    muscle_groups: ['biceps'],
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    instructions: [
      'Hold dumbbells with arms at sides',
      'Curl weights up toward shoulders',
      'Lower with control',
      'Keep elbows stationary'
    ],
    tips: [
      'Don\'t swing the weights',
      'Squeeze biceps at top',
      'Full range of motion'
    ],
    variations: ['Hammer Curl', 'Concentration Curl', 'Cable Curl']
  },
  {
    id: 'tricep_dip',
    name: 'Tricep Dip',
    category: 'strength',
    muscle_groups: ['triceps'],
    equipment: ['bench'],
    difficulty: 'intermediate',
    instructions: [
      'Sit on edge of bench, hands beside hips',
      'Lower body by bending elbows',
      'Push back up to starting position',
      'Keep legs extended or bent for easier version'
    ],
    tips: [
      'Keep elbows close to body',
      'Don\'t go too low if shoulders hurt',
      'Focus on triceps doing the work'
    ],
    variations: ['Assisted Dip', 'Weighted Dip', 'Ring Dip']
  },

  // CORE
  {
    id: 'plank',
    name: 'Plank',
    category: 'strength',
    muscle_groups: ['abs', 'full_body'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in push-up position',
      'Hold body in straight line',
      'Keep core engaged',
      'Breathe normally while holding'
    ],
    tips: [
      'Don\'t let hips sag or pike up',
      'Keep shoulders over elbows',
      'Start with shorter holds, build up time'
    ],
    variations: ['Side Plank', 'Plank Up-Down', 'Plank with Leg Lift']
  },
  {
    id: 'mountain_climber',
    name: 'Mountain Climber',
    category: 'strength',
    muscle_groups: ['abs', 'full_body'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start in plank position',
      'Alternate bringing knees to chest',
      'Keep hips level',
      'Maintain fast pace'
    ],
    tips: [
      'Keep core tight throughout',
      'Don\'t let hips bounce',
      'Land softly on balls of feet'
    ],
    variations: ['Slow Mountain Climber', 'Cross-Body Mountain Climber']
  },

  // CARDIO
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'cardio',
    muscle_groups: ['full_body'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start standing, drop into squat',
      'Jump feet back to plank position',
      'Do push-up (optional)',
      'Jump feet back to squat, then jump up'
    ],
    tips: [
      'Land softly on jumps',
      'Modify by stepping instead of jumping',
      'Keep core engaged throughout'
    ],
    variations: ['Half Burpee', 'Burpee Box Jump', 'Single-Arm Burpee']
  },
  {
    id: 'jumping_jack',
    name: 'Jumping Jack',
    category: 'cardio',
    muscle_groups: ['full_body'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start with feet together, arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to starting position',
      'Maintain steady rhythm'
    ],
    tips: [
      'Land softly on balls of feet',
      'Keep core engaged',
      'Modify by stepping if needed'
    ],
    variations: ['Star Jump', 'Half Jack', 'Squat Jack']
  }
];

export function getExercisesByCategory(category: string): Exercise[] {
  return EXERCISES.filter(exercise => exercise.category === category);
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return EXERCISES.filter(exercise => 
    exercise.muscle_groups.includes(muscleGroup)
  );
}

export function getExercisesByEquipment(equipment: string[]): Exercise[] {
  return EXERCISES.filter(exercise => 
    exercise.equipment.some(eq => equipment.includes(eq))
  );
}

export function searchExercises(query: string): Exercise[] {
  const lowercaseQuery = query.toLowerCase();
  return EXERCISES.filter(exercise => 
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.muscle_groups.some(mg => mg.toLowerCase().includes(lowercaseQuery)) ||
    exercise.category.toLowerCase().includes(lowercaseQuery)
  );
}
