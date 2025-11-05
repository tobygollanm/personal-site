# Toby Gollan-Myers Personal Site

A minimal, fast personal website featuring animated neuron graphics built with Vite, React, TypeScript, and TailwindCSS.

## Features

- **StimulateNeuronHero**: Animated landing sequence with realistic neuron morphology
- **Neuron Graphics**: Reusable neuron components with calcium-style pulsing
- **Interactive Sections**: Home page with 5 navigable sections
- **Neurons Chain Page**: Vertical stack of interconnected neurons
- **Accessibility**: Respects `prefers-reduced-motion` for all animations

## Tech Stack

- Vite
- React 18
- TypeScript
- TailwindCSS
- React Router v6

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/
    Layout.tsx
    StimulateNeuronHero.tsx
    NeuronGraphic.tsx
    SectionNeuron.tsx
    IntroReveal.tsx
  pages/
    Home.tsx
    NeuronsChain.tsx
    Research.tsx
    Neurotech.tsx
    Writing.tsx
    Misc.tsx
  router.tsx
  App.tsx
  main.tsx
  index.css
```

## Animation Details

- Hero sequence: idle → firing (conduction) → release (vesicles) → reveal
- Conduction uses `getTotalLength()` for accurate path animation
- Vesicles animate with staggered delays (120ms between each)
- Calcium pulses are stochastic (12-50s intervals, rescheduled each time)
- Global synchrony events every 25-60s across random neuron subsets
