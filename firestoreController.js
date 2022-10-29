require('dotenv').config();
const moment = require('moment');

const controller = ({ repository: { firebaseService, excelService }, logger, config }) => {
    const db = firebaseService.app.firestore();
    const getTimeStamp = firebaseService.getTimeStamp;

    const collectionNameList = config.collectionNames;

    function getStartDate(date) {
        return moment(date).startOf('day');
    }
    function getEndDate(date) {
        return moment(date).add(1, 'day').startOf('day');
    }
    return {
        async getCountParams(req, res, next) {
            try {
                let counts = [];
                const { minTimeStamp, maxTimestamp } = req.query;

                if (Array.isArray(JSON.parse(collectionNameList))) {
                    for (const name of collectionNameList) {
                        if (typeof name == 'string') {
                            const snapshot = await db
                                .collection(name)
                                .where('createdUTCDateTime', '>=', minTimeStamp)
                                .where('createUTCDateTime', '<=', maxTimestamp)
                                .get();
                            const countDto = {
                                name,
                                date: minTimeStamp,
                                count: snapshot.size,
                            };
                            counts.push(countDto);
                        }
                    }
                    if (counts.length > 0) {
                        const wb = excelService.createSpreadsheet(counts);
                        return res.status(200).send({ message: 'sucess', data: wb });
                    }
                    return res.status(200).send({ message: 'sucess', data: counts });
                } else {
                    return res.status(400).send({ message: 'not such collections', data: [] });
                }
            } catch (e) {
                return res.status(500);
            }
        },
        async getCountFixed(req, res, next) {
            try {
                let counts = [];
                const collectionsNames = ['Ticket', 'Lookup', 'UserTicketGroup', 'Application', 'User', 'Chat', 'TicketAssignedAudit'];
                const timeStamps = [
                    {
                        curr: new Date('2022-7-1'),
                        next: new Date('2022-7-31'),
                    },
                    {
                        curr: new Date('2022-8-1'),
                        next: new Date('2022-8-31'),
                    },
                    {
                        curr: new Date('2022-9-1'),
                        next: new Date('2022-9-30'),
                    },
                ];
                for (const [index, name] of collectionsNames.entries()) {
                    const query = [];
                    const snapshotJuly = await db
                        .collection(name)
                        .where('createdUTCDateTime', '>=', getTimeStamp().fromDate(timeStamps[0].curr))
                        .where('createdUTCDateTime', '<=', getTimeStamp().fromDate(timeStamps[0].next))
                        .get();
                    const snapshotAug = await db
                        .collection(name)
                        .where('createdUTCDateTime', '>=', getTimeStamp().fromDate(timeStamps[1].curr))
                        .where('createdUTCDateTime', '<=', getTimeStamp().fromDate(timeStamps[1].next))
                        .get();
                    const snapshotSept = await db
                        .collection(name)
                        .where('createdUTCDateTime', '>=', getTimeStamp().fromDate(timeStamps[2].curr))
                        .where('createdUTCDateTime', '<=', getTimeStamp().fromDate(timeStamps[2].next))
                        .get();
                    if (name == 'Lookup') {
                        const uniqueJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().clientId)));
                        const uniqueAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().clientId)));
                        const uniqueSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().clientId)));
                        const chatDto = {
                            [name]: {
                                july: {
                                    collectionName: name,
                                    count: snapshotJuly.size,
                                    clientId_count: uniqueJuly.length,
                                },
                                aug: {
                                    collectionName: name,
                                    count: snapshotAug.size,
                                    clientId_count: uniqueAug.length,
                                },
                                sept: {
                                    collectionName: name,
                                    count: snapshotSept.size,
                                    clientId_count: uniqueSept.length,
                                },
                            },
                        };
                        counts.push(chatDto);
                    }
                    if (name == 'Ticket') {
                        const uniqueOJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().orderNo)));
                        const uniqueOAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().orderNo)));
                        const uniqueOSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().orderNo)));
                        const uniqueRJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().requestorName)));
                        const uniqueRAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().requestorName)));
                        const uniqueRSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().requestorName)));
                        const chatDto = {
                            [name]: {
                                july: {
                                    collectionName: name,
                                    count: snapshotJuly.size,
                                    orderNo_count: uniqueOJuly.length,
                                    requestorName_count: uniqueRJuly.length,
                                },
                                aug: {
                                    collectionName: name,
                                    count: snapshotAug.size,
                                    orderNo_count: uniqueOAug.length,
                                    requestorName_count: uniqueRAug.length,
                                },
                                sept: {
                                    collectionName: name,
                                    count: snapshotSept.size,
                                    orderNo_count: uniqueOSept.length,
                                    requestorName_count: uniqueRSept.length,
                                },
                            },
                        };
                        counts.push(chatDto);
                    }
                    if (name == 'UserTicketGroup') {
                        let julyInit = 0;
                        let augInit = 0;
                        let septInit = 0;
                        const uniqueOJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().productId)));
                        const uniqueOAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().productId)));
                        const uniqueOSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().productId)));
                        snapshotJuly.docs.map((item) => {
                            return (julyInit += item.data().unreadMessageCount);
                        });
                        snapshotAug.docs.map((item) => {
                            return (augInit += item.data().unreadMessageCount);
                        });
                        snapshotSept.docs.map((item) => {
                            return (septInit += item.data().unreadMessageCount);
                        });

                        const chatDto = {
                            [name]: {
                                july: {
                                    collectionName: name,
                                    count: snapshotJuly.size,
                                    productId_count: uniqueOJuly.length,
                                    unreadMessage_count: julyInit,
                                },
                                aug: {
                                    collectionName: name,
                                    count: snapshotAug.size,
                                    productId_count: uniqueOAug.length,
                                    unreadMessage_count: augInit,
                                },
                                sept: {
                                    collectionName: name,
                                    count: snapshotSept.size,
                                    productId_count: uniqueOSept.length,
                                    unreadMessage_count: septInit,
                                },
                            },
                        };
                        counts.push(chatDto);
                    }
                    if (name == 'User') {
                        const uniqueOJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().name)));
                        const uniqueOAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().name)));
                        const uniqueOSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().name)));
                        const chatDto = {
                            [name]: {
                                july: {
                                    collectionName: name,
                                    count: snapshotJuly.size,
                                    name_count: uniqueOJuly.length,
                                },
                                aug: {
                                    collectionName: name,
                                    count: snapshotAug.size,
                                    name_count: uniqueOAug.length,
                                },
                                sept: {
                                    collectionName: name,
                                    count: snapshotSept.size,
                                    name_count: uniqueOSept.length,
                                },
                            },
                        };
                        counts.push(chatDto);
                    }
                    if (name == 'Chat') {
                        const uniqueOJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().productId)));
                        const uniqueOAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().productId)));
                        const uniqueOSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().productId)));
                        const uniqueRJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().ticketId)));
                        const uniqueRAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().ticketId)));
                        const uniqueRSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().ticketId)));
                        const chatDto = {
                            [name]: {
                                july: {
                                    collectionName: name,
                                    count: snapshotJuly.size,
                                    productId_count: uniqueOJuly.length,
                                    ticketId_count: uniqueRJuly.length,
                                },
                                aug: {
                                    collectionName: name,
                                    count: snapshotAug.size,
                                    productId_count: uniqueOAug.length,
                                    ticketId_count: uniqueRAug.length,
                                },
                                sept: {
                                    collectionName: name,
                                    count: snapshotSept.size,
                                    productId_count: uniqueOSept.length,
                                    ticketId_count: uniqueRSept.length,
                                },
                            },
                        };
                        counts.push(chatDto);
                    }
                    if (name == 'TicketAssignedAudit') {
                        const uniqueOJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().clientId)));
                        const uniqueOAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().clientId)));
                        const uniqueOSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().clientId)));
                        const uniqueRJuly = Array.from(new Set(snapshotJuly.docs.map((item) => item.data().ticketId)));
                        const uniqueRAug = Array.from(new Set(snapshotAug.docs.map((item) => item.data().ticketId)));
                        const uniqueRSept = Array.from(new Set(snapshotSept.docs.map((item) => item.data().ticketId)));
                        const chatDto = {
                            [name]: {
                                july: {
                                    collectionName: name,
                                    count: snapshotJuly.size,
                                    clientId_count: uniqueOJuly.length,
                                    ticketId_count: uniqueRJuly.length,
                                },
                                aug: {
                                    collectionName: name,
                                    count: snapshotAug.size,
                                    clientId_count: uniqueOAug.length,
                                    ticketId_count: uniqueRAug.length,
                                },
                                sept: {
                                    collectionName: name,
                                    count: snapshotSept.size,
                                    clientId_count: uniqueOSept.length,
                                    ticketId_count: uniqueRSept.length,
                                },
                            },
                        };
                        counts.push(chatDto);
                    }
                }
                return res.status(200).send({ message: 'sucess', data: counts });
            } catch (e) {
                throw new Error(`failed with 500 ${e.message}`);
            }
        },
        async healthCheck(req, res, status) {
            return res.status(200).send({ message: 'sucess', data: [] });
        },
    };
};

module.exports = controller;
