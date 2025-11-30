import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import {
  Carousel,
  CarouselItem,
  FormField,
  IconBadge,
  InfoTile,
  Pill,
  PrimaryButton,
  SectionContainer,
  SectionDescription,
  SectionHeading,
  SectionTitle,
  SelectField,
  SimpleGrid,
  Stack,
  SurfaceCard,
  TextField,
  Toast,
} from './ui';

describe('PrimaryButton', () => {
  it('applies the outline variant class', () => {
    const { getByRole } = render(
      <PrimaryButton variant="outline">Test</PrimaryButton>
    );

    expect(getByRole('button')).toHaveTextContent('Test');
  });
});

describe('Pill', () => {
  it('renders custom text', () => {
    const { getByText } = render(<Pill>Eco</Pill>);

    expect(getByText('Eco')).toBeInTheDocument();
  });
});

describe('Section primitives', () => {
  it('centers the section container by default', () => {
    const { getByTestId } = render(
      <SectionContainer data-testid="section">Content</SectionContainer>
    );

    expect(getByTestId('section')).toHaveClass('max-w-7xl');
  });

  it('disables centering when requested', () => {
    const { getByTestId } = render(
      <SectionContainer data-testid="section" centered={false}>
        Content
      </SectionContainer>
    );

    expect(getByTestId('section')).not.toHaveClass('max-w-7xl');
  });

  it('applies tone and alignment styles', () => {
    const { getByText, getByRole } = render(
      <>
        <SectionHeading tone="sun">Highlight</SectionHeading>
        <SectionTitle align="center">Services</SectionTitle>
        <SectionDescription size="large" align="center">
          Description
        </SectionDescription>
      </>
    );

    expect(getByText('Highlight')).toHaveClass('text-saubio-sun');
    expect(getByRole('heading', { name: 'Services' })).toHaveClass('text-center');
    expect(getByText('Description')).toHaveClass('sm:text-2xl');
  });
});

describe('SurfaceCard', () => {
  it('supports dark variant without elevation', () => {
    const { getByText } = render(
      <SurfaceCard variant="dark" elevated={false} withBorder>
        Card content
      </SurfaceCard>
    );

    const card = getByText('Card content');
    expect(card).toHaveClass('bg-saubio-forest');
    expect(card).toHaveClass('border-saubio-forest/10');
    expect(card).not.toHaveClass('shadow-soft-lg');
  });
});

describe('InfoTile', () => {
  it('renders icon and description with inverse tone', () => {
    const { getByTestId, getByText } = render(
      <InfoTile
        data-testid="tile"
        icon="★"
        title="Eco bonus"
        description="All cleaners certified eco."
        tone="inverse"
      />
    );

    expect(getByTestId('tile')).toHaveClass('bg-saubio-forest');
    expect(getByText('★')).toBeInTheDocument();
    expect(getByText('All cleaners certified eco.')).toHaveClass('text-white/80');
  });
});

describe('Layout primitives', () => {
  it('applies stack direction, alignment and wrap', () => {
    const { getByTestId } = render(
      <Stack
        data-testid="stack"
        direction="row"
        gap="lg"
        align="center"
        justify="between"
        wrap
      >
        <span>One</span>
        <span>Two</span>
      </Stack>
    );

    expect(getByTestId('stack')).toHaveClass('flex-row');
    expect(getByTestId('stack')).toHaveClass('gap-6');
    expect(getByTestId('stack')).toHaveClass('items-center');
    expect(getByTestId('stack')).toHaveClass('justify-between');
    expect(getByTestId('stack')).toHaveClass('flex-wrap');
  });

  it('renders responsive columns for the simple grid', () => {
    const { getByTestId } = render(
      <SimpleGrid data-testid="grid" columns={{ base: 1, md: 4 }} gap="sm">
        <div>Item</div>
      </SimpleGrid>
    );

    expect(getByTestId('grid')).toHaveClass('grid-cols-1');
    expect(getByTestId('grid')).toHaveClass('md:grid-cols-4');
    expect(getByTestId('grid')).toHaveClass('gap-3');
  });
});

describe('Carousel', () => {
  it('renders controls and carousel items', () => {
    const { getByRole, getAllByRole } = render(
      <Carousel ariaLabel="Testimonials">
        <CarouselItem>Card 1</CarouselItem>
        <CarouselItem>Card 2</CarouselItem>
      </Carousel>
    );

    expect(getByRole('button', { name: /forwards/i })).toBeInTheDocument();
    expect(getAllByRole('group')[0]).toHaveAttribute('aria-label', 'Testimonials');
  });
});

describe('Form controls', () => {
  it('associates label, description and error', () => {
    const { getByLabelText, getByText } = render(
      <FormField label="First name" htmlFor="first-name" description="Public profile" error="Required">
        <TextField id="first-name" hasError placeholder="Jane" />
      </FormField>
    );

    const field = getByLabelText('First name');
    expect(field).toHaveAttribute('placeholder', 'Jane');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(getByText('Public profile')).toBeInTheDocument();
    expect(getByText('Required')).toHaveClass('text-red-600');
  });

  it('renders select field inside form field', () => {
    const { getByLabelText } = render(
      <FormField label="Locale" htmlFor="locale">
        <SelectField id="locale" defaultValue="de">
          <option value="de">DE</option>
          <option value="en">EN</option>
        </SelectField>
      </FormField>
    );

    expect(getByLabelText('Locale')).toHaveDisplayValue('DE');
  });
});

describe('IconBadge', () => {
  it('renders icon with tone', () => {
    const { getByText } = render(<IconBadge tone="sun">☆</IconBadge>);

    expect(getByText('☆')).toHaveClass('bg-saubio-sun');
  });
});

describe('Toast', () => {
  it('renders success toast with action and dismiss button', () => {
    const action = jest.fn();
    const dismiss = jest.fn();
    const { getByText } = render(
      <Toast
        open
        variant="success"
        title="Booking created"
        description="We reserved the slot."
        actions={[{ label: 'View booking', onClick: action }]}
        dismissLabel="Close"
        onDismiss={dismiss}
      />
    );

    expect(getByText('Booking created')).toBeInTheDocument();
    getByText('View booking').click();
    expect(action).toHaveBeenCalledTimes(1);
    getByText('Close').click();
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
