import { VotacionRepository, ElectionFilters, ElectionListResult } from '../../domain/VotacionRepository';
import { Election, ElectionResults } from '../../domain/Election';
import { Option } from '../../domain/Option';
import { Vote } from '../../domain/Vote';
import { Op, fn, col, literal } from 'sequelize';
import { ElectionModel } from '../models/Election.model';
import { OptionModel } from '../models/Option.model';
import { VoteModel } from '../models/Vote.model';

const VOTES_COUNT = literal('(select count(*) from votes v where v."electionId" = "ElectionModel"."id")');

function toDomain(row: any, hasVoted = false): Election {
  const options = (row.options || []).map(
    (option: any) => new Option(option.id, option.electionId, option.title, option.description ?? '')
  );

  return new Election(
    row.id,
    row.title,
    row.description ?? '',
    row.startDate,
    row.endDate,
    row.status,
    options,
    Number(row.votesCount ?? 0),
    hasVoted
  );
}

export class SequelizeVotacionRepository implements VotacionRepository {
  async createElection(election: Election): Promise<Election> {
    const created = await ElectionModel.create({
      id: election.id,
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      status: election.status,
    });

    if (election.options.length > 0) {
      await OptionModel.bulkCreate(
        election.options.map((option) => ({
          id: option.id,
          electionId: created.id,
          title: option.title,
          description: option.description,
        }))
      );
    }

    return election;
  }

  async findElectionById(id: string, userId?: string): Promise<Election | null> {
    const model = await ElectionModel.findByPk(id, {
      attributes: { include: [[VOTES_COUNT, 'votesCount']] },
      include: [{ model: OptionModel, as: 'options' }],
    });

    if (!model) return null;

    const hasVoted = userId ? await this.hasUserVoted(id, userId) : false;

    return toDomain(model.get({ plain: true }), hasVoted);
  }

  async findAll(filters: ElectionFilters): Promise<ElectionListResult> {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const { rows, count } = await ElectionModel.findAndCountAll({
      where,
      attributes: { include: [[VOTES_COUNT, 'votesCount']] },
      include: [{ model: OptionModel, as: 'options' }],
      order: [['createdAt', 'DESC']],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      distinct: true,
    });

    return {
      items: rows.map((model) => toDomain(model.get({ plain: true }))),
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(count / filters.limit)),
    };
  }

  async findActiveElections(): Promise<Election[]> {
    const now = new Date();

    const models = await ElectionModel.findAll({
      where: {
        status: 'ACTIVE',
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
      },
      attributes: { include: [[VOTES_COUNT, 'votesCount']] },
      include: [{ model: OptionModel, as: 'options' }],
      order: [['endDate', 'ASC']],
    });

    return models.map((model) => toDomain(model.get({ plain: true })));
  }

  async updateStatus(id: string, status: Election['status']): Promise<Election | null> {
    const [affected] = await ElectionModel.update({ status }, { where: { id } });
    if (affected === 0) return null;
    return this.findElectionById(id);
  }

  async saveVote(vote: Vote): Promise<Vote> {
    await VoteModel.create({
      id: vote.id,
      electionId: vote.electionId,
      optionId: vote.optionId,
      userId: vote.userId,
    });
    return vote;
  }

  async hasUserVoted(electionId: string, userId: string): Promise<boolean> {
    const count = await VoteModel.count({ where: { electionId, userId } });
    return count > 0;
  }

  async getResults(electionId: string): Promise<ElectionResults | null> {
    const election = await ElectionModel.findByPk(electionId, { attributes: ['id', 'title', 'status'] });
    if (!election) return null;

    const options = await OptionModel.findAll({
      where: { electionId },
      attributes: ['id', 'title', [fn('COUNT', col('votes.id')), 'voteCount']],
      include: [{ model: VoteModel, as: 'votes', attributes: [], required: false }],
      group: ['OptionModel.id'],
      order: [['id', 'ASC']],
    });

    const rows = options.map((option) => ({
      optionId: String(option.getDataValue('id')),
      title: String(option.getDataValue('title')),
      voteCount: Number(option.getDataValue('voteCount') ?? 0),
    }));

    const totalVotes = rows.reduce((total, row) => total + row.voteCount, 0);

    return {
      electionId: election.id,
      title: election.title,
      status: election.status,
      totalVotes,
      options: rows.map((row) => ({
        ...row,
        percentage: totalVotes === 0 ? 0 : Math.round((row.voteCount / totalVotes) * 1000) / 10,
      })),
    };
  }
}
