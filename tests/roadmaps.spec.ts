import { expect, test } from '@playwright/test';
import {
  bestRoadmapMatch,
  countRoadmapSteps,
  getRoadmap,
  getRoadmaps,
  matchRoadmaps,
  normalizeText,
} from '../lib/roadmaps';

test('every curated roadmap is complete: stages, steps and skills', () => {
  const roadmaps = getRoadmaps();
  expect(roadmaps.length).toBeGreaterThanOrEqual(7);
  for (const roadmap of roadmaps) {
    expect(roadmap.title.length).toBeGreaterThan(1);
    expect(roadmap.aliases.length).toBeGreaterThan(2);
    expect(roadmap.stages.length).toBeGreaterThanOrEqual(3);
    expect(countRoadmapSteps(roadmap)).toBeGreaterThanOrEqual(8);
    for (const stage of roadmap.stages) {
      expect(stage.goal.length).toBeGreaterThan(5);
      expect(stage.steps.length).toBeGreaterThanOrEqual(2);
      for (const step of stage.steps) {
        expect(step.description.length).toBeGreaterThan(3);
        expect(step.skills.length).toBeGreaterThanOrEqual(1);
      }
    }
  }
});

test('roadmap search matches Persian names, aliases and English spellings', () => {
  expect(bestRoadmapMatch('پایتون')?.slug).toBe('python');
  expect(bestRoadmapMatch('python')?.slug).toBe('python');
  expect(bestRoadmapMatch('فرانت‌اند')?.slug).toBe('frontend');
  expect(bestRoadmapMatch('frontend')?.slug).toBe('frontend');
  expect(bestRoadmapMatch('بک اند')?.slug).toBe('backend');
  expect(bestRoadmapMatch('جاوااسکریپت')?.slug).toBe('javascript');
  expect(bestRoadmapMatch('js')?.slug).toBe('javascript');
  expect(bestRoadmapMatch('ریاضی')?.slug).toBe('math');
  expect(bestRoadmapMatch('فیزیک')?.slug).toBe('physics');
  expect(bestRoadmapMatch('زبان C')?.slug).toBe('c');
  expect(bestRoadmapMatch('عبارت ناموجود آزمایشی')).toBeNull();
});

test('normalizeText folds Arabic/Persian spelling differences', () => {
  expect(normalizeText('  جاوا اسکریپت  ')).toBe('جاوا اسکریپت');
  expect(normalizeText('جاوااسكريپت')).toBe(normalizeText('جاوااسکریپت'));
  expect(normalizeText('Python')).toBe('python');
});

test('matchRoadmaps scores exact names above partial matches', () => {
  const matches = matchRoadmaps('python');
  expect(matches[0].roadmap.slug).toBe('python');
  expect(matches[0].score).toBe(100);
});

test('roadmap slugs resolve individually', () => {
  for (const slug of ['frontend', 'backend', 'python', 'javascript', 'c', 'math', 'physics']) {
    expect(getRoadmap(slug)?.slug).toBe(slug);
  }
  expect(getRoadmap('unknown-roadmap')).toBeNull();
});
