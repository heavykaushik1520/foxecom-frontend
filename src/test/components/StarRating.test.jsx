import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StarRating from '../../components/StarRating';

describe('StarRating', () => {
  it('renders correct number of filled stars', () => {
    render(<StarRating rating={4} count={10} />);
    const filledStars = document.querySelectorAll('.bi-star-fill');
    expect(filledStars.length).toBe(4);
  });

  it('displays "No reviews" when count is 0', () => {
    render(<StarRating rating={0} count={0} />);
    expect(screen.getByText('No reviews')).toBeInTheDocument();
  });

  it('displays review count', () => {
    render(<StarRating rating={5} count={25} />);
    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('rounds rating correctly', () => {
    render(<StarRating rating={3.7} count={5} />);
    const filledStars = document.querySelectorAll('.bi-star-fill');
    expect(filledStars.length).toBe(4); // Rounded to 4
  });
});
