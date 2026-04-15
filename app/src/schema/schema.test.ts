/**
 * Schema tests — ensures all bounds, refinements, and defaults work.
 */
import { describe, it, expect } from 'vitest'
import {
  Id, Timestamp, ClerkUserId, Name, Text, Content, Email, UrlString,
  Username, Category, Tag, Tags, Visibility, JoinCode, WorkspaceJson,
  PageParams,
  Project, PublishProjectInput, ReportProjectInput,
  Classroom, CreateClassroomInput, Assignment, Submission, Discussion,
  Reply, ChatMessage, MemberRole,
  Notification, DailyScore, SubmitDailyScoreInput, Subscription, FreeOverride,
} from './index.js'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

describe('Primitives', () => {
  describe('Id', () => {
    it('accepts UUID v4', () => {
      expect(Id.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true)
    })
    it('rejects non-UUID', () => {
      expect(Id.safeParse('not-a-uuid').success).toBe(false)
    })
    it('rejects empty', () => {
      expect(Id.safeParse('').success).toBe(false)
    })
  })

  describe('Timestamp', () => {
    it('accepts valid unix ms', () => {
      expect(Timestamp.safeParse(Date.now()).success).toBe(true)
    })
    it('rejects negative', () => {
      expect(Timestamp.safeParse(-1).success).toBe(false)
    })
    it('rejects non-integer', () => {
      expect(Timestamp.safeParse(1.5).success).toBe(false)
    })
    it('rejects past year 2100', () => {
      expect(Timestamp.safeParse(5_000_000_000_000).success).toBe(false)
    })
  })

  describe('ClerkUserId', () => {
    it('accepts clerk format', () => {
      expect(ClerkUserId.safeParse('user_2abc123xyz').success).toBe(true)
    })
    it('rejects empty', () => {
      expect(ClerkUserId.safeParse('').success).toBe(false)
    })
    it('rejects special chars', () => {
      expect(ClerkUserId.safeParse('user<script>').success).toBe(false)
    })
  })

  describe('Name', () => {
    it('accepts normal name', () => {
      expect(Name.safeParse('My Project').success).toBe(true)
    })
    it('trims whitespace', () => {
      const result = Name.parse('  hello  ')
      expect(result).toBe('hello')
    })
    it('rejects empty after trim', () => {
      expect(Name.safeParse('   ').success).toBe(false)
    })
    it('rejects at max+1', () => {
      expect(Name.safeParse('a'.repeat(101)).success).toBe(false)
    })
  })

  describe('Text / Content', () => {
    it('Text accepts empty', () => {
      expect(Text.safeParse('').success).toBe(true)
    })
    it('Text rejects at max+1', () => {
      expect(Text.safeParse('a'.repeat(501)).success).toBe(false)
    })
    it('Content rejects empty', () => {
      expect(Content.safeParse('').success).toBe(false)
    })
    it('Content rejects at max+1', () => {
      expect(Content.safeParse('a'.repeat(5001)).success).toBe(false)
    })
  })

  describe('Email', () => {
    it('accepts valid email', () => {
      expect(Email.safeParse('user@example.com').success).toBe(true)
    })
    it('lowercases', () => {
      expect(Email.parse('USER@EXAMPLE.COM')).toBe('user@example.com')
    })
    it('rejects invalid', () => {
      expect(Email.safeParse('not-an-email').success).toBe(false)
    })
    it('rejects over 320 chars', () => {
      expect(Email.safeParse('a'.repeat(310) + '@example.com').success).toBe(false)
    })
  })

  describe('Username', () => {
    it('accepts unicode', () => {
      expect(Username.safeParse('Jason 🦊').success).toBe(true)
    })
    it('rejects empty', () => {
      expect(Username.safeParse('').success).toBe(false)
    })
  })

  describe('Category', () => {
    it('accepts known categories', () => {
      expect(Category.safeParse('Games').success).toBe(true)
      expect(Category.safeParse('General').success).toBe(true)
    })
    it('rejects unknown', () => {
      expect(Category.safeParse('Hacking').success).toBe(false)
    })
  })

  describe('Tag / Tags', () => {
    it('accepts lowercase slug', () => {
      expect(Tag.safeParse('my-tag').success).toBe(true)
    })
    it('rejects uppercase', () => {
      expect(Tag.safeParse('MyTag').success).toBe(false)
    })
    it('rejects spaces', () => {
      expect(Tag.safeParse('my tag').success).toBe(false)
    })
    it('Tags caps at max', () => {
      expect(Tags.safeParse(Array(10).fill('tag')).success).toBe(true)
      expect(Tags.safeParse(Array(11).fill('tag')).success).toBe(false)
    })
  })

  describe('Visibility', () => {
    it('defaults to private', () => {
      expect(Visibility.parse(undefined)).toBe('private')
    })
    it('accepts public/private', () => {
      expect(Visibility.safeParse('public').success).toBe(true)
      expect(Visibility.safeParse('private').success).toBe(true)
    })
    it('rejects unknown', () => {
      expect(Visibility.safeParse('secret').success).toBe(false)
    })
  })

  describe('JoinCode', () => {
    it('accepts 6 uppercase alphanum', () => {
      expect(JoinCode.safeParse('AB12CD').success).toBe(true)
    })
    it('rejects lowercase', () => {
      expect(JoinCode.safeParse('ab12cd').success).toBe(false)
    })
    it('rejects wrong length', () => {
      expect(JoinCode.safeParse('ABC12').success).toBe(false)
      expect(JoinCode.safeParse('ABC1234').success).toBe(false)
    })
  })

  describe('WorkspaceJson', () => {
    it('accepts valid JSON', () => {
      expect(WorkspaceJson.safeParse('{"blocks":[]}').success).toBe(true)
    })
    it('rejects invalid JSON', () => {
      expect(WorkspaceJson.safeParse('{not valid}').success).toBe(false)
    })
    it('rejects empty', () => {
      expect(WorkspaceJson.safeParse('').success).toBe(false)
    })
    it('accepts up to 2MB', () => {
      const big = JSON.stringify({ data: 'x'.repeat(1_000_000) })
      expect(WorkspaceJson.safeParse(big).success).toBe(true)
    })
    it('rejects over 2MB', () => {
      const tooBig = JSON.stringify({ data: 'x'.repeat(2_000_001) })
      expect(WorkspaceJson.safeParse(tooBig).success).toBe(false)
    })
    it('rejects deeply nested JSON (>20 levels)', () => {
      let nested: unknown = 1
      for (let i = 0; i < 25; i++) nested = { x: nested }
      expect(WorkspaceJson.safeParse(JSON.stringify(nested)).success).toBe(false)
    })
    it('accepts normal nesting (<20 levels)', () => {
      let nested: unknown = 1
      for (let i = 0; i < 15; i++) nested = { x: nested }
      expect(WorkspaceJson.safeParse(JSON.stringify(nested)).success).toBe(true)
    })
  })

  describe('Control characters (XSS/log injection prevention)', () => {
    it('Name rejects null byte', () => {
      expect(Name.safeParse('evil\x00name').success).toBe(false)
    })
    it('Name rejects escape sequence', () => {
      expect(Name.safeParse('evil\x1bname').success).toBe(false)
    })
    it('Text rejects control chars', () => {
      expect(Text.safeParse('desc\x07').success).toBe(false)
    })
    it('Content allows newlines and tabs', () => {
      expect(Content.safeParse('line 1\nline 2\twith tab').success).toBe(true)
    })
    it('Content rejects null bytes', () => {
      expect(Content.safeParse('msg\x00').success).toBe(false)
    })
    it('Username rejects control chars', () => {
      expect(Username.safeParse('user\x01').success).toBe(false)
    })
  })

  describe('UrlString protocol blocking', () => {
    it('accepts https', () => {
      expect(UrlString.safeParse('https://example.com').success).toBe(true)
    })
    it('accepts relative path', () => {
      expect(UrlString.safeParse('/dashboard').success).toBe(true)
    })
    it('rejects javascript:', () => {
      expect(UrlString.safeParse('javascript:alert(1)').success).toBe(false)
    })
    it('rejects data:text/html', () => {
      expect(UrlString.safeParse('data:text/html,<script>').success).toBe(false)
    })
    it('rejects vbscript:', () => {
      expect(UrlString.safeParse('vbscript:msgbox').success).toBe(false)
    })
    it('rejects with whitespace prefix', () => {
      expect(UrlString.safeParse('  javascript:alert(1)').success).toBe(false)
    })
  })

  describe('PageParams', () => {
    it('applies defaults', () => {
      const parsed = PageParams.parse({})
      expect(parsed.limit).toBe(20)
      expect(parsed.offset).toBe(0)
    })
    it('coerces string params (URL query)', () => {
      const parsed = PageParams.parse({ limit: '30', offset: '10' })
      expect(parsed.limit).toBe(30)
      expect(parsed.offset).toBe(10)
    })
    it('caps limit at MAX_PAGE_SIZE', () => {
      expect(PageParams.safeParse({ limit: 100 }).success).toBe(false)
    })
    it('caps offset at MAX_PAGE_OFFSET', () => {
      expect(PageParams.safeParse({ offset: 20_000 }).success).toBe(false)
    })
    it('rejects negative offset', () => {
      expect(PageParams.safeParse({ offset: -1 }).success).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

describe('Project schemas', () => {
  const validInput = {
    name: 'My Game',
    workspaceJson: '{"blocks":[]}',
  }

  it('PublishProjectInput accepts minimal valid', () => {
    expect(PublishProjectInput.safeParse(validInput).success).toBe(true)
  })

  it('PublishProjectInput applies defaults', () => {
    const parsed = PublishProjectInput.parse(validInput)
    expect(parsed.description).toBe('')
    expect(parsed.category).toBe('General')
  })

  it('PublishProjectInput rejects empty name', () => {
    expect(PublishProjectInput.safeParse({ ...validInput, name: '' }).success).toBe(false)
  })

  it('PublishProjectInput rejects oversized workspace', () => {
    expect(PublishProjectInput.safeParse({
      ...validInput,
      workspaceJson: JSON.stringify({ x: 'a'.repeat(2_000_001) }),
    }).success).toBe(false)
  })

  it('PublishProjectInput rejects unknown category', () => {
    expect(PublishProjectInput.safeParse({ ...validInput, category: 'Hackz' }).success).toBe(false)
  })

  it('PublishProjectInput rejects over-tagged', () => {
    expect(PublishProjectInput.safeParse({
      ...validInput,
      tags: Array(11).fill('tag'),
    }).success).toBe(false)
  })

  it('ReportProjectInput validates reason enum', () => {
    expect(ReportProjectInput.safeParse({ reason: 'spam' }).success).toBe(true)
    expect(ReportProjectInput.safeParse({ reason: 'bad-vibes' }).success).toBe(false)
  })

  it('Project requires all stored fields', () => {
    const full = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Game',
      authorId: 'user_abc123',
      authorName: 'Jason',
      description: '',
      category: 'Games',
      workspaceJson: '{}',
      tags: [],
      blockCount: 5,
      parentId: null,
      visibility: 'public',
      downloads: 0,
      likes: 0,
      createdAt: Date.now(),
    }
    expect(Project.safeParse(full).success).toBe(true)
  })

  it('Project accepts anonymous author', () => {
    const full = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Game', authorId: 'anonymous', authorName: 'Anon',
      workspaceJson: '{}', createdAt: Date.now(),
    }
    expect(Project.safeParse(full).success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Classrooms
// ---------------------------------------------------------------------------

describe('Classroom schemas', () => {
  it('CreateClassroomInput requires name', () => {
    expect(CreateClassroomInput.safeParse({}).success).toBe(false)
    expect(CreateClassroomInput.safeParse({ name: 'Math 101' }).success).toBe(true)
  })

  it('MemberRole is bounded', () => {
    expect(MemberRole.safeParse('teacher').success).toBe(true)
    expect(MemberRole.safeParse('student').success).toBe(true)
    expect(MemberRole.safeParse('admin').success).toBe(false)
  })

  it('Discussion requires body', () => {
    expect(Discussion.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      classroomId: '550e8400-e29b-41d4-a716-446655440001',
      authorId: 'user_abc',
      authorName: 'Jason',
      title: 'Question',
      body: '',
      createdAt: Date.now(),
    }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// User-related
// ---------------------------------------------------------------------------

describe('User schemas', () => {
  it('Notification validates type enum', () => {
    const n = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user_abc',
      type: 'like',
      title: 'Someone liked your project',
      createdAt: Date.now(),
    }
    expect(Notification.safeParse(n).success).toBe(true)
    expect(Notification.safeParse({ ...n, type: 'explosion' }).success).toBe(false)
  })

  it('DailyScore caps block usage', () => {
    expect(SubmitDailyScoreInput.safeParse({ dayNumber: 1, blocksUsed: 1 }).success).toBe(true)
    expect(SubmitDailyScoreInput.safeParse({ dayNumber: 1, blocksUsed: 0 }).success).toBe(false)
    expect(SubmitDailyScoreInput.safeParse({ dayNumber: 1, blocksUsed: 10_000 }).success).toBe(false)
  })

  it('FreeOverride lowercases email', () => {
    const parsed = FreeOverride.parse({
      email: 'USER@EXAMPLE.COM',
      plan: 'pro',
      note: '',
      createdAt: Date.now(),
    })
    expect(parsed.email).toBe('user@example.com')
  })

  it('Subscription status is bounded', () => {
    const s = {
      userId: 'user_abc',
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_abc',
      status: 'active',
      plan: 'pro',
      createdAt: Date.now(),
    }
    expect(Subscription.safeParse(s).success).toBe(true)
    expect(Subscription.safeParse({ ...s, status: 'hacked' }).success).toBe(false)
  })
})
