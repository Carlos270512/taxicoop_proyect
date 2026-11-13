import { VotacionRepository } from '../../domain/VotacionRepository';
import { Election } from '../../domain/Election';
import { Option } from '../../domain/Option';
import { Vote } from '../../domain/Vote';
import { ElectionModel } from '../models/Election.model';
import { OptionModel } from '../models/Option.model';
import { VoteModel } from '../models/Vote.model';
import { fn, col, literal } from 'sequelize';

export class SequelizeVotacionRepository implements VotacionRepository {
  
  async createElection(election: Election): Promise<Election> {
    const electionModel = await ElectionModel.create({
      id: election.id,
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      status: election.status,
    });

    if (election.options && election.options.length > 0) {
      await Promise.all(
        election.options.map((opt) =>
          OptionModel.create({
            id: opt.id || crypto.randomUUID(),
            electionId: electionModel.id || election.id,
            title: opt.title,
            description: opt.description,
          })
        )
      );
    }

    return election;
  }

  async findElectionById(id: string): Promise<Election | null> {
    const model = await ElectionModel.findByPk(id, {
      include: [{ model: OptionModel, as: 'options' }],
    });

    if (!model) return null;

    const plain = model.get({ plain: true });

    const options = (plain.options || []).map(
      (opt: any) => new Option(opt.id, opt.electionId, opt.title, opt.description)
    );

    return new Election(
      plain.id,
      plain.title,
      plain.description,
      plain.startDate,
      plain.endDate,
      plain.status,
      options
    );
  }

  async findActiveElections(): Promise<Election[]> {
    const models = await ElectionModel.findAll({
      where: { status: 'ACTIVE' },
      include: [{ model: OptionModel, as: 'options' }],
    });

    return models.map((model) => {
      const plain = model.get({ plain: true });
      const options = (plain.options || []).map(
        (opt: any) => new Option(opt.id, opt.electionId, opt.title, opt.description)
      );

      return new Election(
        plain.id,
        plain.title,
        plain.description,
        plain.startDate,
        plain.endDate,
        plain.status,
        options
      );
    });
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
    const count = await VoteModel.count({
      where: { electionId, userId },
    });
    return count > 0;
  }

  async getResults(electionId: string): Promise<Array<{ optionId: string; title: string; voteCount: number }>> {
    const options = await OptionModel.findAll({
      where: { electionId },
      attributes: [
        'id',
        'title',
        [fn('COUNT', col('votes.id')), 'voteCount'],
      ],
      include: [
        {
          model: VoteModel,
          as: 'votes',
          attributes: [],
          required: false,
        },
      ],
      group: ['OptionModel.id'],
    });

    return options.map((opt: any) => ({
      optionId: opt.id,
      title: opt.title,
      voteCount: parseInt(opt.getDataValue('voteCount') || '0', 10),
    }));
  }
}