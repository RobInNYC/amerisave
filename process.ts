import * as fs from 'fs';
import * as path from 'path';


type TallyItem = {
	email: string;
	total: number;
}

type Tally = {
	logs_id: string;
	tally: Array<TallyItem>;
}

type LogEntry = {
	"id": string;
	"email": string;
	"message": string;
};

type Log = {
	id: string;
	logs: LogEntry[];
};

const mergeTallies = (sourceMap: Tally, destMap: Tally): void => {
	sourceMap.tally.forEach((ti: TallyItem) => {
		const foundIndex: number = findEmailIndex(destMap.tally, ti.email);
		if (foundIndex < 1) {
			destMap.tally.push({
				email: ti.email,
				total: ti.total
			});
		}
		else {
			destMap.tally[foundIndex].total += ti.total;
		}
	});
}

const findEmailIndex = (array: TallyItem[], email: string): number => {
	for (let i = 0; i < array.length; i ++) {
		if (array[i].email.toLowerCase() === email.toLowerCase()) return i;
	}
	return -1;
}

const ingestFile = async (filePath: string): Promise<Tally> => {
	let fileTally: Tally = { logs_id: '', tally: [] };

	const fileData: string = fs.readFileSync(filePath).toString();
	const fileObject: Log = JSON.parse(fileData);
	fileTally.logs_id = fileObject.id;
	fileObject.logs.forEach((li: LogEntry) => {
		const foundIndex: number = findEmailIndex(fileTally.tally, li.email);
		if (foundIndex < 1) {
			fileTally.tally.push({
				email: li.email,
				total: 1
			});
		}
		else {
			fileTally.tally[foundIndex].total ++;
		}
	});

	return fileTally;
}

const processAllData = async (): Promise<void> => {
	let globalTally: Tally = { logs_id: '', tally: [] };
	let allFileTallies: Array<Tally> = [];

	const LOG_DIR: string = __dirname + '/logs';
	const dirContents: string[] = fs.readdirSync(LOG_DIR);
	await dirContents.forEach(async (di: string) => {
		const fileTally: Tally = await ingestFile(`${LOG_DIR}/${di}`);
		allFileTallies.push(fileTally);
		mergeTallies(fileTally, globalTally);
		console.log(JSON.stringify(fileTally, null, 4));
	});

	console.log('Final tallies:');
	console.log('--------------');
	console.log(JSON.stringify(globalTally, null, 4));
}



processAllData();
